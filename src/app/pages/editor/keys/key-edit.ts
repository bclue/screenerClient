import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../reducers';
import { MD_CARD_DIRECTIVES } from '@angular2-material/card';
import { MD_INPUT_DIRECTIVES } from '@angular2-material/input';
import {
  MdUniqueSelectionDispatcher,
  MD_RADIO_DIRECTIVES
} from '@angular2-material/radio';
import { KeyActions } from '../../../actions/keys';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button';
import 'rxjs/add/operator/map'

@Component({
  template: `
  <div class="flex flex-column" style="width:100%;">
    <md-card style="width:85%; margin-top:2%; height:95vh;">
      <div style="width: 50%; margin-left:25%; margin-right:25%;">
        <md-card-title> EDIT KEY </md-card-title>
        <md-card-subtitle> edit a key name and type</md-card-subtitle>
        <md-card-content>
          <md-input [(ngModel)]="id"  placeholder="key id"></md-input>
          <md-card-subtitle> key type</md-card-subtitle>
          <md-radio-group [(ngModel)] = "type">
            <md-radio-button value="number">number</md-radio-button>
            <md-radio-button value="string">string</md-radio-button>
            <md-radio-button value="boolean">boolean</md-radio-button>
          </md-radio-group>
        </md-card-content>
        <md-card-actions>
          <button md-raised-button (click)="submit()">UPDATE</button>
        </md-card-actions>
        <md-card *ngIf="error !== null" style="background-color: red">
          <md-card-subtitle > {{ error }} </md-card-subtitle>
        </md-card>
        <md-card *ngIf="success === true" style="background-color: green">
          <md-card-subtitle > key uploaded successfully </md-card-subtitle> 
          <md-card-actions>
            <a [routerLink]="['/editor/keys']">
              <button button md-raised-button color="primary">OVERIVEW</button>
            </a>
          </md-card-actions>
        </md-card>
      </div>
    </md-card>
  </div>
  `,
  providers: [MdUniqueSelectionDispatcher],
  directives: [
    MD_CARD_DIRECTIVES, 
    MD_INPUT_DIRECTIVES, 
    MD_RADIO_DIRECTIVES,
    ROUTER_DIRECTIVES,
    MD_BUTTON_DIRECTIVES
  ]
})
export class KeyDetailEdit implements OnInit{
  editKey$: any;
  keys$: any;
  keys: any = new Array<any>();
  type: any = '';
  id: any = '';
  newKey = {
    type: null,
    id: null
  };
  success = false;
  error = null;
  errorTypes = {
    identicalID: 'this ID already exits with a different type',
    identicalIDandType: 'this ID already exists with this type',
    invalidIDorType: 'either the id or type is blank/unselected'
  }
  
  
  constructor(private store: Store<AppState>){}
  
  ngOnInit(){
    this.keys$ = this.store.select('keys').map( (store:any) => store.keys)
    this.editKey$ = this.store.select('keys').map( (store:any) => store.editKey)
    const sub = this.keys$.subscribe(
      (key) => {
        this.keys.push(key);
      }
    )
    const sub2 = this.editKey$.subscribe(
      (key) => {
        this.id = key.id;
        this.type = key.type;
      }
    )
    sub.unsubscribe();
    sub2.unsubscribe();
  }
  
  submit(){
    let valid = true;
    
    if(this.id === '' || this.type === ''){
      valid = false;
      this.success = false;
      this.error = this.errorTypes.invalidIDorType;
    }
    
    
    if(valid){
      for(let i = 0; i < this.keys.length; i++){
        const key = this.keys[i];
        if(key.id === this.id && key.type !== this.type){
          valid = false;
          this.success = false;
          this.error = this.errorTypes.identicalID;
          break;
        } else if(key.id === this.id && key.type === this.type){
          valid = false;
          this.success = false;
          this.error = this.errorTypes.identicalIDandType;
          break;
        }
      }
    }
    
    
    if(valid){
      this.error = null;
      this.success = true;
      this.store.dispatch({
        type: KeyActions.UPDATE_EDIT_KEY, 
        payload: {
          id: this.id,
          type: this.type
        }
      })
    } 
  }
}