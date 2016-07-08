import { DataService } from '../services/index';
import { MasterScreenerActions } from '../actions';
import { MasterScreener, Question } from '../models';
import { Injectable } from '@angular/core';
import { Effect, StateUpdates, toPayload } from '@ngrx/effects';
import { AppState } from '../reducers';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/of';

@Injectable()
export class MasterScreenerEffects{
  constructor(
    private updates$: StateUpdates<AppState>,
    private masterScreenerActions: MasterScreenerActions,
    private dataService: DataService
  ){ }
  
  @Effect() loadQuestionsOnInit$ = Observable.of(this.masterScreenerActions.loadQuestions());
  
  @Effect() loadQuestions$ = this.updates$ 
    .whenAction(MasterScreenerActions.LOAD_QUESTIONS)
    .switchMapTo( this.dataService.getQuestions())
    .do( x => {
      console.log(x);
      console.log(x[0]);
      console.log(x[1]);
    })
    .map( (questions:Question[]) => {return this.masterScreenerActions.loadQuestionsSuccess(questions)})
    
}