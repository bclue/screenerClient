import { Injectable } from '@angular/core';
import { ScreenerModel, ScreenerNetwork, State, Id, Command, Question } from './index';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ScreenerController {
  private model: ScreenerModel;
  private cachedStates$ = new ReplaySubject<State>(15);
  private errors = new Map<string, Id[]>();
  private GLOBAL_ERROR_TIMEOUT = 5000;
  private state: State = {
    questions: [],
    created: -1,
    keys: [],
    unusedKeys: [],
    errors: new Map<string, string[]>()
  }

  public state$ = new BehaviorSubject<State>(this.state);
  public commands = this.exposeCommands();
  public command$ = new Subject<Command>();


  constructor(private network: ScreenerNetwork) {
    this.command$
      .filter( command => command.fn !== undefined )
      .let(this.whitelistedCommand)
      .do( _ => this.cachedStates$.next(this.state) )
      .mergeMap( command => Observable.of( command.fn.apply(this, command.args) ))
      .mergeMap( _ => Observable.of( this.update()) )
      .subscribe( _ => this.state$.next( this.state ), 
                (error) => console.error(`error: ${error.message} caught in command$ subject`),
                () => console.log('[ScreenerController].command$ is complete.'));
  }

  populateModel() {
    this.network.pull().subscribe(
      response => {
        this.model = new ScreenerModel(response);
        this.update();
      },
      error => console.error(error),
      () => console.log('[ScreenerController].populateModel:  NETWORK PULL COMPLETE')
    )
  }

  save() { return this.verify().mergeMap( data => this.network.push(data) ).do(data => this.model.setModel(data)) }

  addOption(hostID: Id, value: number) { this.model.addOption(hostID, value) }

  removeOption(hostID: Id, value: number) { this.model.removeOption(hostID, value) }

  clearOptions(hostID: Id) {
    this.model.clearOptions(hostID);
  }

  private clearConditionals(hostID: Id) {
    try {
      this.model.clearConditionals(hostID);
    } catch (e) {
      this.addGlobalError('unable to clear conditionalQuestions');
    }
  }

  private deleteQuestion(questionID: Id) {
    const modelQuestion = this.model.findQuestionById(questionID);    
    try {
      if (modelQuestion.expandable && modelQuestion.conditionalQuestions.length > 0) {
        this.model.clearConditionals(questionID);
      }
      this.model.deleteQuestion(questionID);
    } catch (e) {
      console.error(e.message);
      this.addGlobalError('unable to delete question');
    }
  }

  private keyChange(oldKeyName: string, updatedKeyName: string) {
    if (oldKeyName === undefined || updatedKeyName.substr(0, 7) === 'invalid' || !this.hasKey(updatedKeyName)){
      console.warn('[ScreenerController].keyChange: improper arguements in keyChange');
      console.warn(oldKeyName);
      console.warn(updatedKeyName);
      console.warn(`this.hasKey(${updatedKeyName}: ${this.hasKey(updatedKeyName)})`);
      this.addGlobalError('Unable to update unused keys.')
      return;
    }

    if (oldKeyName.substr(0, 7) === 'invalid') {
      this.model.useKey(updatedKeyName);
    } else {
      this.model.releaseKey(oldKeyName);
      this.model.useKey(updatedKeyName);
    }
  }

  private swapQuestions(sourceID: string, targetKeyName: string){
    if (typeof targetKeyName !== 'string' || typeof sourceID !== 'string') {
      console.warn('[ScreenerController].swapQuestions: improper arguements in swapQuestions');
      console.warn(sourceID);
      console.warn(targetKeyName);
      this.addGlobalError('unable to swap questions');
      return;
    }
    
    const targetQuestion = this.model.findQuestionByKey(targetKeyName);    
    try {
      this.model.swapQuestions(sourceID, targetQuestion.id)
    } catch (e) {
      console.error('[ScreenerController].swapQuestions: unable to find targetQuestion');
      console.error(sourceID);
      console.error(targetKeyName);
      console.error(targetQuestion);
      console.error(e);
      this.addGlobalError('unable to swap questions');
    }

  }

  private addConstantQuestion() { this.model.addQuestion() }

  private addConditionalQuestion(hq: Question ) {
    if (!hq || hq.id === undefined) {
      console.error('[ScreenerController].addConditionalQuestion: attempting to add conditional to question that has no id');
      this.addGlobalError('Unable to add conditional question. Host question is undefined.');
      return;
    }

    const hostQuestion = this.model.findQuestionById(hq.id);
    if (hostQuestion === undefined) {
      console.error('[ScreenerController].addConditionalQuestion: unable to find hostQuestion');
      console.error(hostQuestion)
      this.addGlobalError('Unable to add conditional question. Can not find host.');
      return;
    }

    try {
      this.model.addConditionalQuestion(hostQuestion.id)
    } catch (e) {
      this.addError(hq.id, e);
    }
  }

  findGroup(question_id: string): FormGroup { return this.model.getQuestionControl(question_id) }

  findQuestionByKey(key: string): Question { return this.model.findQuestionByKey(key) }

  findQuestionById(id: string): Question { return this.model.findQuestionById(id) }

  hasKey(keyName) { return this.model.findKey(keyName) !== undefined }

  private update() {
    const freshModel = this.model.pull();
    try {
      this.state = {
        questions: [...freshModel.questions ].sort(this.model.questionComparator),
        created: freshModel.created,
        unusedKeys: [...freshModel.unusedKeys ].sort(this.model.keyComparator),
        keys: [...freshModel.keys ].sort(this.model.keyComparator),
        errors: new Map<string, string[]>(this.errors)
      }
    } catch(e) {
      console.error('[ScreenerController].update: unable to update state.')
      console.error(e);
    } 
  }

  // ensures that all expected properties are on each question 
  // and that there are no clashing key.type and question.controlType
  private verify(): Observable<{ [key: string]: Question[] | number }> {
    const values = this.model.questionValues();
    const { conditionalQuestions, questions } = this.partitionQuestions(values);
    
    let encounteredError = false;

    const presentBoolean = (question: Question) => (key) => {
      if (key === 'key' && typeof question[key] === 'string' && question[key].substr(0, 7) === 'invalid') return false;

      return question[key] !== undefined && question[key] !== 'invalid' && question[key] !== '';
    };

    for (const q of [...questions, ...conditionalQuestions]) {
      const checker = presentBoolean(q);
      const failedChecking = ['label', 'index', 'controlType', 'key', 'expandable', 'conditionalQuestions', 'id', 'options'].filter(checker);

      if (failedChecking.length !== 4) {
        this.addError(q.id, 'question is missing a required property');
        encounteredError = true;
      }
    }

    
    const findKeyType = keyName => {
      const key = this.model.findKey(keyName);
      if (key !== undefined) return key.type;
    }

    const key_type_checker = (questions: any[]) => {
      const conflictA = questions.filter(q => q.controlType !== 'CheckBox' && findKeyType(q.key) === 'boolean')
      const conflictB = questions.filter(q => findKeyType(q.key) === 'integer' && q.controlType === 'CheckBox')
      const conflicts = [...conflictA, ...conflictB];


      if (conflicts.length !== 0) {
        console.error(conflicts);
        encounteredError = true;
        const ids = conflicts.map(q => q.id);
        for(const id of ids) {
          if (conflictA.find(q => q.id === id) !== undefined) {
            this.addError(id, 'key type is boolean and controltype is not checkbox');
          }
          if (conflictB.find(q => q.id === id) !== undefined) {
            this.addError(id, 'key type is integer and controltype is checkbox');
          }
        }
      }
    }

    if (encounteredError) {
      return Observable.throw(this.errors);
    } else {
      this.clearErrors();
    }

    return Observable.of({
      questions: questions,
      conditionalQuestion: conditionalQuestions,
      created: -1
    })
  }

  private addError(questionID: Id, error: string) {
    const present = this.errors.get(questionID) || [];
    present.push(error);
    this.errors.set(questionID, present);
  }

  private addGlobalError(error: string) {
    const present = this.errors.get('global') || [];
    if (present.find(err => err === error) !== undefined ) return

    present.push(error);
    this.errors.set('global', present);
    
    const clearError = () => this.errors.set('global', this.errors.get('global').filter(err => err !== error));
    setTimeout(clearError, this.GLOBAL_ERROR_TIMEOUT);
  }

  private clearErrors() {
    this.errors.clear();
  }

  // partion an array of questions into conditional and constant questions
  private partitionQuestions(questions: Question[]): { [key: string]: Question[] } {
    const returnObj = {
      conditionalQuestions: [],
      questions: []
    }

    return questions.reduce( (accum, question) => {
      if(this.model.isConditionalQuestion(question.id)) {
        accum.conditionalQuestions.push(question);
      } else {
        accum.questions.push(question);
      }
      return accum;
    }, returnObj)
  }

  private whitelistedCommand(source: Observable<Command>): Observable<Command> {
    const commands = [ 
                        this.swapQuestions, this.deleteQuestion, this.addConstantQuestion,
                        this.clearConditionals, this.addConditionalQuestion, this.keyChange
                     ]

    return source.filter(command => commands.find(c => c === command.fn) !== undefined);
  }

  private exposeCommands() {
    const swapQuestions = this.swapQuestions;
    const deleteQuestion = this.deleteQuestion;
    const addConstantQuestion = this.addConstantQuestion;
    const clearConditionals = this.clearConditionals;
    const addConditionalQuestion = this.addConditionalQuestion;
    const keyChange = this.keyChange;
    return {
      swapQuestions,
      deleteQuestion,
      addConstantQuestion,
      clearConditionals,
      addConditionalQuestion,
      keyChange
    }
  }

}