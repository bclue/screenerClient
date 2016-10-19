import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducer';
import * as masterScreener from './master-screener.actions';

@Injectable()
export class MasterScreenerGuardService implements CanActivate {

  constructor(private store: Store<fromRoot.State>) {}

  canActivate(): boolean {
    this.store.dispatch(new masterScreener.LoadLatestVersion({}));
    this.store.dispatch(new masterScreener.LoadScreenerVersionsInfo({}));
    return true;
  }
}
