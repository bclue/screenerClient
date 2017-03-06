import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question, ID, QuestionType, QUESTION_TYPE_CONDITIONAL, QUESTION_TYPE_CONSTANT } from '../../models';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../reducer';

import { DragDropManagerService, DragDatum } from './drag-drop-manager.service';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
})
export class QuestionListComponent implements OnInit, OnDestroy {
  @Input() questions: ID[];
  @Input() form: FormGroup;
  @Input() type: QuestionType; // are these conditional or constant questions in the list?
  @Input() host_id: ID | undefined; // undefined if these are constant questions
  @Output() questionSelect = new EventEmitter<ID>();
  @Output() questionUnselect = new EventEmitter<ID>();
  @Output() addQuestion = new EventEmitter<{[key: string]: QuestionType | ID }>();
  @Output() dragEvent =  new EventEmitter<DragDatum>();

  private classes: { [key: string]: {[key: string]: boolean} } = { };
  private constant_type: QuestionType = QUESTION_TYPE_CONSTANT;
  private conditional_type: QuestionType = QUESTION_TYPE_CONDITIONAL;

  private selectedQuestionID: Subscription;
  private destroySubs$ = new Subject();
  

  constructor(
    private store: Store<fromRoot.State>, 
    private dragManager: DragDropManagerService
  ) {}

  handleAddQuestion() {
    if (this.type === QUESTION_TYPE_CONSTANT ) {
      Promise.resolve(this.addQuestion.emit({type: QUESTION_TYPE_CONSTANT}))
        .then( _ => setTimeout( () => this.selectTarget(this.questions[this.questions.length - 1]), 60))
        .then( _ => {
          const id = this.questions[this.questions.length -1];
          this.showSelection(id);
        })
      return;
    } else if (this.type === QUESTION_TYPE_CONDITIONAL ) {
      Promise.resolve(this.addQuestion.emit({type: QUESTION_TYPE_CONDITIONAL, host_id: this.host_id}))
        .then( _ => setTimeout( () => this.selectTarget(this.questions[this.questions.length -1]), 60))
        .then( _ => {
          const id = this.questions[this.questions.length -1];
          this.showSelection(id);
        })
    } else {
      console.warn('[QuestionList]: unkown type @Input()');
    }
  } 

  handleSelect(questionID: ID) {
    
    const deselectAll = () => {
      for (const key in this.classes) {
        if (this.classes[key]['selected'] === true) this.classes[key]['selected'] = false;
      }
    }


    const selected_id = Object.keys(this.classes).find(id => this.classes[id]['selected'] === true);
    if (selected_id !== undefined && selected_id === questionID) {
      console.log("QUESTION UNSELECT")
      this.questionUnselect.emit(selected_id);
      deselectAll();
      return;
    } 

    deselectAll();

    if (this.classes[questionID] === undefined) this.classes[questionID] = { };

    this.classes[questionID]['selected'] = true;

    
    Promise.resolve(this.questionUnselect.emit(selected_id))
           .then(_ => this.questionSelect.emit(questionID));
  }
  
  ngOnInit(){
    this.selectedQuestionID = Observable.merge(
      this.store.let(fromRoot.getSelectedConstantID),
      this.store.let(fromRoot.getSelectedConditionalID)
    )
    .filter( id => this.questions.find(qid => qid === id) !== undefined)
    .takeUntil(this.destroySubs$)
    .subscribe( id => { this.selectTarget(id); console.log(this.classes) });
  }
 

  showSelection(selectedID) {
    const element = document.getElementById(selectedID);
    scrollIntoView(element);
    const index = this.questions.findIndex(id => id === selectedID)
    const targetID = index >= 0 ? this.questions[index] : undefined;
    this.selectTarget(targetID);
  }

  deselectAll() {
    for (const key in this.classes) {
      if (this.classes[key]['selected'] === true) this.classes[key]['selected'] = false;
    }
  }

  selectTarget(targetID){
    this.deselectAll();

    if (targetID === undefined) return;

    if(this.classes[targetID] === undefined) this.classes[targetID] = { };

    this.classes[targetID]['selected'] = true;
  }

  ngOnDestroy() { 
    // attempt to clear the selected class that sticks after route change...
    for(const key in this.classes) delete this.classes[key];
    
    this.destroySubs$.next(); 
  }

  dragStart(id, $event) {
    if (this.classes[id]) {
      this.classes[id] = (<any>Object).assign({}, this.classes[id], { dragStart: true})
    } else {
      this.classes[id] = (<any>Object).assign({}, {
        selected: false,
        dragStart: true,
        dragOver: false,
      })
    }
    
    // hack to make elements draggable in firefox
    // http://mereskin.github.io/dnd/
    $event.dataTransfer.setData('text', 'foo');

    this.dragManager.liftItem(id);
  }

  dragEnter(id, $event) {
    if($event.preventDefault) {
      $event.preventDefault();
    }
    if (this.classes[id]) {
      this.classes[id] = (<any>Object).assign({}, this.classes[id], { dragOver: true})
    } else {
      this.classes[id] = (<any>Object).assign({}, {
        selected: false,
        dragStart: false,
        dragOver: true,
      })
    }
  }

  dragOver(id, $event){
    if ($event.preventDefault) {
      $event.preventDefault();
    }
    if (this.classes[id]) {
      this.classes[id] = (<any>Object).assign({}, this.classes[id], { dragOver: true})
    } else {
      this.classes[id] = (<any>Object).assign({}, {
        selected: false,
        dragStart: false,
        dragOver: true,
      })
    }
    return false;
  }

  dragLeave(id) {
    if (this.classes[id]) {
      this.classes[id] = (<any>Object).assign({}, this.classes[id], { dragOver: false})
    } else {
      this.classes[id] = (<any>Object).assign({}, {
        selected: false,
        dragStart: false,
        dragOver: false,
      })
    }
  }

  drop(id, $event) {
    if($event.preventDefault){
      $event.preventDefault();
    }

    if($event.stopPropagation) {
      $event.stopPropagation();
    }    

    const targetKey = $event.target.innerText;
    let targetNode = $event.target;
    let targetClassNames = $event.target.className.split(" ");
    let i = 0;
    while(targetClassNames.find(name => name === 'question-item') === undefined) {
      targetNode = targetNode.parentNode;
      targetClassNames = targetNode.className.split(" ");
      i++
      if (i > 10) break;
    }

    if (Array.isArray(targetNode.id.split('-')) && 
        targetNode.id.split('-').length > 0 &&
        typeof targetNode.id.split('-')[0] === 'string')
    {
      this.dragManager.dropItem( targetNode.id.split('-')[0] );
    }

    for (const key in this.classes) {
      this.classes[key]['dragStart'] = false;
      this.classes[key]['dragOver'] = false;
    }
    
    //this.dragManager.dropItem(targetID)
    return false;
  }

  dragEnd() {
    for(const key in this.classes) {
      this.classes[key]['dragOver'] = false;
      this.classes[key]['dragStart'] = false;
    }
  }
}


function scrollIntoView(element){if (element) element.scrollIntoView({block: "start", behavior: "smooth"});}