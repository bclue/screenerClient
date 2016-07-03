import { ActionReducer, Action } from '@ngrx/store';
import { Media, MEDIA_SMALL, MEDIA_MEDIUM, MEDIA_LARGE } from '../models';
import { MediaActions } from '../actions'; 

export interface MediaState {
  width: string;
};

const initialState: MediaState = {
  width: MEDIA_SMALL
}

export function mediaReducer(state = initialState, action: Action): MediaState {
  switch(action.type){
    case MediaActions.SET_SIZE: {
      return state;
    }
    
    default: {
      return state;
    }
  }
}