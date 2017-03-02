import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { Screener, ID, Question } from '../../models';
import { ScreenerActions, ScreenerActionTypes } from './screener-actions';
import { FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import { questionValidator } from '../validators';

interface Styles {
  selected: boolean;
  error: boolean;
};

type ScreenerStyles = { [key: string]: Styles };
type ControlMap = { [key: string]: AbstractControl };

export interface State {
  loading: boolean;
  styles: ScreenerStyles;
  form: FormGroup;
  error: string;
  selectedConstantQuestion: ID;
  selectedConditionalQuestion: ID;
};

export const initialState: State = {
  loading: false,
  styles: {},
  form: new FormGroup({}),
  error: '',
  selectedConstantQuestion: undefined,
  selectedConditionalQuestion: undefined,
};

export function reducer(state = initialState, action: ScreenerActions): State {
  switch (action.type) {


    case ScreenerActionTypes.ADD_QUESTION: {
      if (state.form === undefined) return state;

      const index = getConstantQuestionsLength(state);
      const question = blankQuestion(index);
      const control = question_to_control(question);
      state.form.addControl(question.id, new FormGroup(control))
      state.styles[question.id] = freshStyle();
      return state;
    }


    case ScreenerActionTypes.ADD_CONDITIONAL_QUESTION: {
      if (state.form === undefined || action.payload === undefined || typeof action.payload !== 'string') return state;

      const hostID = <ID>action.payload;
      const hostForm = state.form.get(hostID);

      if( hostForm === null ) return state;

      const hostQuestion: Question = hostForm.value
      const index = getConditionalQuestionsLength(hostID, state)
      
      if ( index < 0 ) return state;

      const question = blankQuestion(index);
      question.expandable = false;
      const control = question_to_control(question);
      state.form.addControl(question.id, new FormGroup(control));
      state.form.get([hostID, 'conditionalQuestions']).setValue([...hostQuestion.conditionalQuestions, question.id]);
      state.styles[question.id] = freshStyle();

      return state;
    }


    case ScreenerActionTypes.DELETE_QUESTION: {
      if (state.form === undefined || action.payload === undefined || typeof action.payload !== 'string') return state;

      const id = <ID>action.payload;
      const hostID = isConditionalQuestion(id, state);

      if (typeof hostID === 'string') {
        const hostQuestion: Question = state.form[hostID].value;
        state.form.get([hostID, 'conditionalQuestions'])
                  .setValue(hostQuestion.conditionalQuestions.filter(c_id => c_id !== id));
      }
      state.form.removeControl(id);

      delete state.styles[id];

      return state;
    }


    case ScreenerActionTypes.LOAD_DATA: return (<any>Object).assign({}, state, { loading: true} );


    case ScreenerActionTypes.LOAD_DATA_FAILURE: {
      return (<any>Object).assign( state, {
        loading: false,
        error: 'unable to load data from server'
      })
    }


    case ScreenerActionTypes.LOAD_DATA_SUCCESS: {
      if (action.payload === undefined) return state;

      const screener = <Screener>action.payload;

      if ( !Array.isArray(screener.conditionalQuestions) || !Array.isArray(screener.conditionalQuestions) ){
        return (<any>Object).assign({}, state, {
          loading: false,
          error: 'loaded data is corrupt and unable to be displayed'
        })
      } 

      const allQuestions = [...screener.conditionalQuestions, ...screener.questions];

      const form: FormGroup = allQuestions
          .map(question => question_to_control(question))
          .map(control => new FormGroup(control))
          .map(group => { group.setValidators([questionValidator]); return group })
          .reduce( (_form, control) => { 
            _form.addControl(control.value.id, control); 
            return _form 
          }, new FormGroup({}));

      const styles: ScreenerStyles = allQuestions.reduce( (_styles, question) => {
        _styles[question.id] = freshStyle();
        return _styles;
      }, {});

      return (<any>Object).assign({}, {
        loading: false,
        error: '',
        styles,
        form
      })
    }

    case ScreenerActionTypes.SAVE_DATA: {
      let error = false

      for (const id in state.styles) {
        if (state.styles[id].error === false){
          error = true;
          break;
        }
      }

      const errorPresent = error === true || state.error !== '';

      return errorPresent ? 
        (<any>Object).assign({}, state, { error: 'errors detected, unable to save.' }) :
        (<any>Object).assign({}, state, { loading: true });
    }


    case ScreenerActionTypes.SAVE_DATA_FAILURE: {
      const error = action.payload !== undefined ? action.payload : 'save failed.'

      return (<any>Object).assign({}, state, { 
        loading: false,
        error
      })
    }


    case ScreenerActionTypes.SAVE_DATA_SUCCESS: return (<any>Object).assign({}, state, { loading: false })

    case ScreenerActionTypes.SELECT_QUESTION: {
      if(action.payload === undefined || typeof action.payload !== 'string') return state;

      const id = action.payload;
      const host_id = isConditionalQuestion(id, state);

      if(host_id === false) {
        return (<any>Object).assign({}, state, {
          selectedConstantQuestion: id,
          selectedConditionalQuestion: undefined
        })
      };

      return (<any>Object).assign({}, state,  {
        selectedConditionalQuestion: id
      });
    }

    case ScreenerActionTypes.SWAP_QUESTIONS: {
      if (action.payload === undefined) return state;

      const payload = <{[key: string]: ID}>action.payload,
            id_a    = payload['id_a'],
            id_b    = payload['id_b'];

      if (state.form.get(id_a) === null || state.form.get(id_b) === null) return state;

      state.form.get([id_a, 'index']).setValue(state.form.get([id_b, 'index']).value);
      state.form.get([id_b, 'index']).setValue(state.form.get([id_a, 'index']).value);
      return state; 
    }

    default: {
      return state;
    }

  }
}

// following functions are used in main reducer

export function getForm(state$: Observable<State>){
  return state$.select(s => s.form);
}

export function getStyles(state$: Observable<State>){
  return state$.select(s => s.styles);
}

export function getError(state$: Observable<State>){
  return state$.select(s => s.error);
}

export function isLoading(state$: Observable<State>){
  return state$.select(s => s.loading);
}

export function getConstantQuestions(state$: Observable<State>){
  return state$.select(s => [ s.form, s ])
    .map( ([form, state]) => {
      const f = <FormGroup>form;
      const s = <State>state;
      const keys = Object.keys(f.value);

      return keys.map(k => f.value[k])
        .filter( q => isConditionalQuestion(q.id, s) === false )
        .sort( (a, b) => a.index - b.index);
    })
}

export function getSelectedConstantID(state$: Observable<State>){
  return state$.select(s => s.selectedConstantQuestion);
}

export function getSelectedConditionalID(state$: Observable<State>){
  return state$.select(s => s.selectedConditionalQuestion);
}

export function getConditionalQuestions(state$: Observable<State>){
  return state$.select(s => [ s.selectedConstantQuestion, s ] )
    .map( ([id, state]) => {
      const _state = <State>state; const _id = <ID>id;
      const conditionalQuestions = _state.form.value[_id].conditionalQuestions;
      return conditionalQuestions.map(c_id => _state.form.value[c_id]).sort( (a, b) => a.index - b.index)
    })
}


// these following functions are used internally

export function blankQuestion(index: number): Question {
  const id = randomString();
  const key = 'invalid'.concat(randomString())
  return {
    controlType: 'invalid',
    key: key,
    label: '',
    expandable: false,
    index: index,
    id: id,
    conditionalQuestions: [],
    options: []
  };
}

export function question_to_control(question: Question): ControlMap {
  
  const approvedProperties = [
    'conditionalQuestions',
    'controlType',
    'expandable',
    'id',
    'index',
    'key',
    'label',
    'options'
  ]

  return Object.keys(question)
    .filter(key => approvedProperties.find(p => p === key) !== undefined)
    .reduce( (accum, key) => { accum[key] = new FormControl(question[key]); return accum; }, {});
}


export function getConstantQuestionsLength(state: State): number {
  const value: { [key: string]: Question } = state.form.value;

  return Object.keys(state.form).reduce( (length: number, key) => {
    const id = value[key].id;
    return isConditionalQuestion(id, state) !== false ? length : length + 1;
  }, 0);
}

export function getConditionalQuestionsLength(hostID: ID, state: State): number {
  if (state === undefined || state.form === undefined) return -1;
  const questionValues: { [key: string]: Question } = state.form.value;
  
  const question = questionValues[hostID]
  if ( question === undefined ) return -1;

  if (question.expandable === false 
      || !Array.isArray(question.conditionalQuestions) || isConditionalQuestion(hostID, state) !== false) 
    return -1;

  return question.conditionalQuestions.length;
}


export function isConditionalQuestion(id: ID, state: State): ID | false {
  if (state === undefined || state.form === undefined) return false;
  const questionValues: { [key: string]: Question } = state.form.value;

  for (const key in questionValues) {
    const q: Question = questionValues[key];
    if (Array.isArray(q.conditionalQuestions) && q.conditionalQuestions.find(cq_id => cq_id === id) !== undefined) {
      return q.id;
    }
  }

  return false;
}

function randomString() {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 20; i++) {
    let randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

function freshStyle(): Styles {
  return {
    selected: false,
    error: false
  }
}