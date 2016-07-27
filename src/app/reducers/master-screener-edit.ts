import { ActionReducer, Action } from '@ngrx/store';
import { MasterScreenerEdit, Question } from '../models';
import { MasterScreenerEditActions } from '../actions';

export interface MasterScreenerEditState{
  data: MasterScreenerEdit;
  editQuestion: Question;
  expandableQuestion: Question;
  keys: {key:string, type:string}[]
}

const initialState: MasterScreenerEditState = {
  data: undefined,
  editQuestion: undefined,
  expandableQuestion: undefined,
  keys: undefined
}

export function MasterScreenerEditReducer(state = initialState, action: Action): MasterScreenerEditState{
  switch(action.type){
    case MasterScreenerEditActions.LOAD_QUESTIONS: {
      return state;
    };
    
    case MasterScreenerEditActions.LOAD_QUESTIONS_SUCCESS: {
      const questions: Question[] = action.payload;
      const keys = [
        {
          key: 'children',
          type: 'boolean'
        },
        {
          key: 'number_of_children',
          type: 'number'
        },
        {
          key: 'yearly_personal_income',
          type: 'number'
        },
        {
          key: 'married',
          type: 'boolean'
        }
      ]
      
      
      return {
        data: {
          questions: questions
        },
        editQuestion: {
          value: '',
          key: '',
          label: '',
          controlType: '',
          type: '',
          control: null,
          expandable: [],
          options: []
        },
        expandableQuestion: {
          value: '',
          key: '',
          label: '',
          controlType: '',
          type: '',
          control: null,
          expandable: null,
          options: []
        },
        keys: keys
      }
    };
    
    case MasterScreenerEditActions.MAKE_EXPANDABLE_QUESTION: {
      const editQuestion = state.editQuestion;
      editQuestion.type = 'expandable';
      editQuestion.controlType = 'checkbox';
      editQuestion.options = [];
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.UNMAKE_EXPANDABLE_QUESTION: {
      const editQuestion = state.editQuestion;
      editQuestion.type = '';
      editQuestion.controlType = '';
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.EDIT_QUESTION_LABEL: {
      const editQuestion = state.editQuestion;
      editQuestion.label = action.payload;
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.SET_CONTROL_TYPE: {
      const editQuestion = state.editQuestion;
      editQuestion.controlType = action.payload;
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.ADD_OPTION: {
      const editQuestion = state.editQuestion;
      editQuestion.options.push(action.payload);
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.REMOVE_OPTION: {
      const editQuestion = state.editQuestion;
      editQuestion.options.splice(action.payload, 1);
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.EDIT_EXPANDABLE_QUESTION_LABEL: {
      const expandableQuestion = state.expandableQuestion;
      expandableQuestion.label = action.payload;
      return {
        data: state.data,
        editQuestion: state.editQuestion, 
        expandableQuestion: expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.SET_EXPANDABLE_CONTROL_TYPE: {
      const expandableQuestion = state.expandableQuestion;
      expandableQuestion.controlType = action.payload;
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.ADD_EXPANDABLE_OPTION: {
      const expandableQuestion = state.expandableQuestion;
      expandableQuestion.options.push(action.payload)
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: expandableQuestion,
        keys: state.keys
      } 
    }
    
    case MasterScreenerEditActions.REMOVE_EXPANDABLE_OPTION: {
      const expandableQuestion = state.expandableQuestion;
      expandableQuestion.options.splice(action.payload, 1);
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: expandableQuestion,
        keys: state.keys
      } 
    }    
    
    case MasterScreenerEditActions.PUSH_EXPANDABLE_QUESTION: {
      const editQuestion = state.editQuestion;
      editQuestion.expandable.push(state.expandableQuestion);
      const clearExpandableQuestion = {
        value: '',
        key: '',
        label: '',
        controlType: '',
        type: '',
        control: null,
        expandable: null,
        options: []
      }
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: clearExpandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.DELETE_EXPANDABLE_QUESTION: {
      const editQuestion = state.editQuestion;
      editQuestion.expandable.splice(action.payload, 1);
      return {
        data: state.data,
        editQuestion: editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.SET_EDIT_EXPANDABLE: {
      const expandableQuestion = state.editQuestion.expandable[action.payload];
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.CLEAR_EXPANDABLE_QUESTION: {
      const clearExpandableQuestion = {
        value: '',
        key: '',
        label: '',
        controlType: '',
        type: '',
        control: null,
        expandable: null,
        options: []
      }
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: clearExpandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.DELETE_QUESTION: {
      // this case is not entirely "pure" because of some type of binding to state.data.questions 
      // in components/editor/master-screener
      const index = state.data.questions.indexOf(action.payload);
      state.data.questions.splice(index, 1);
      return {
        data: state.data,
        editQuestion: state.editQuestion,
        expandableQuestion: state.expandableQuestion,
        keys: state.keys
      }
    }
    
    case MasterScreenerEditActions.SWAP_QUESTIONS: {
      const a = action.payload.questionA;
      const b = action.payload.questionB;
      const aIndex = state.data.questions.indexOf(a);
      const bIndex = state.data.questions.indexOf(b);
      if(aIndex < 0 || bIndex < 0){
        return state;
      }
      // impure swap function incoming Dan Abramov would probably cry :(
      state.data.questions[aIndex] = b;
      state.data.questions[bIndex] = a;
      
      return state;
    }
    
    default: {
      return state;
    }
  }
}