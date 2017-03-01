import { 
  Component, OnInit, Input, ViewEncapsulation, 
  Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ScreenerController } from '../../services/screener-controller';
import { Id, Question } from '../../services';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-user-question',
  templateUrl: './user-question.component.html',
  styleUrls: ['./user-question.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UserQuestionComponent implements OnInit, OnDestroy {
  @Input() question: BehaviorSubject<Id>;
  @Output() makeExpandable = new EventEmitter<boolean>();

  private form: FormGroup;
  private unusedKeys: Observable<string[]>;
  private errors: string[] = [];
  private currentKey: string = '';
  private currentControl: string = '';
  
  private optionInput: FormControl;

  private subscriptions: Subscription[] = [];
  private formUpdate: Subscription;


  constructor( public controller: ScreenerController, private fb: FormBuilder ) {}


  
  ngOnInit() {
    this.optionInput = new FormControl('');

    this.formUpdate = this.question.subscribe(id => {
      this.form = this.controller.findGroup(id);
      this.updateObservables(); 
    })

    this.unusedKeys = this.controller.state$.map(state => state.unusedKeys);


    const errors = Observable.combineLatest(
      this.controller.state$.map(state => state.errors),
      this.question
    )
    .subscribe( ([errors, questionID]) => this.errors = errors.has(questionID) ? [...errors.get(questionID)] : []);


    this.subscriptions = [ errors, ...this.subscriptions ];
  }

  private updateObservables() {
    if (this.form === null) {
      this.form = undefined;
      return;
    }
    
    const oldSubs = [...this.subscriptions];

    if (this.form.get('expandable') === null) throw new Error('[UserQuestionComponent].ngOnInit: expandable control is null');
   
    const expandChange = this.form.get('expandable').valueChanges
      .do(value => this.makeExpandable.emit(value)  )
      .subscribe();



    if (this.form.get('key') === null) throw new Error('[UserQuestionComponent].ngOnInit: key control is null');

    this.currentKey = this.form.get('key').value;

    const keyChange = this.form.get('key').valueChanges
      .subscribe(updatedKey => {
        this.controller.command$.next({
          fn: this.controller.commands.keyChange,
          args: [ this.currentKey, updatedKey ]
        })
        this.currentKey = updatedKey;
      });



    if (this.form.get('controlType') === null ) throw new Error('[UserQuestionComponent].ngOnInit: controlType control is null');
    
    this.currentControl = this.form.get('controlType').value;


    const controlTypeChange = Observable.combineLatest(
        this.form.get('controlType').valueChanges,
        this.question
    )
      .subscribe( ([updatedControlType, id]) => {
        const keyType = this.controller.getKeyType(id);
        const question = this.controller.findQuestionById(id);
        if (keyType === 'boolean' && updatedControlType !== 'CheckBox' && 
            question !== undefined && question.expandable && question.conditionalQuestions.length > 0){
          // set message to user that this operation will delete the conditonalQuestions
        }

        this.controller.command$.next({
          fn: this.controller.commands.controlTypeChange,
          args: [ id, this.currentControl, updatedControlType ]
        })
      })

    this.subscriptions = [ controlTypeChange, keyChange, expandChange ]
    this.clearSubscriptions(oldSubs);
  }

  private clearSubscriptions(subscriptions: Subscription[]) {
    for(const sub of subscriptions) {
      if (!sub.closed) {
        sub.unsubscribe();
      }
    }
  }

  ngOnDestroy() {
    this.clearSubscriptions(this.subscriptions);

    if (this.formUpdate !== undefined && !this.formUpdate.closed) this.formUpdate.unsubscribe();
  }


  handleOptionAdd() {
    const value = this.optionInput.value;

    if ( value === '') return;

    const scan = Number.parseInt(value, 10);
    if (!Number.isNaN(scan)) {
      this.question.take(1).subscribe(id => {
        this.controller.addOption(id, scan);
        this.optionInput.setValue('');
      })
    } else {
      this.optionInput.setValue('');
    }
  }

  removeOption(option) {
    this.question.take(1).subscribe(id => this.controller.removeOption(id, option));
  }
}


