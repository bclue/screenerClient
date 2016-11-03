import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { DataService } from '../../data.service';
import * as programOverview from './actions';
import { UserFacingProgram } from '../../../shared/models';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class ProgramOverviewEffects {

  @Effect() loadPrograms$ = this.actions$
    .ofType(programOverview.ProgramOverviewActionsTypes.LOAD_PROGRAMS)
    .switchMap(() => this.data.loadPrograms())
    .map(programs => new programOverview.LoadProgramsSuccess(programs));

  @Effect() updateProgram$ = this.actions$
    .ofType(programOverview.ProgramOverviewActionsTypes.UPDATE_PROGRAM)
    .map<UserFacingProgram>(action => action.payload)
    .switchMap(program => this.data.updateProgram(program))
    .map(programs => new programOverview.UpdateProgramSuccess(programs));

  @Effect() createProgram$ = this.actions$
    .ofType(programOverview.ProgramOverviewActionsTypes.CREATE_PROGRAM)
    .map<UserFacingProgram>(action => action.payload)
    .switchMap(program => this.data.createProgram(program))
    .map(programs => new programOverview.CreateProgramSuccess(programs));

  constructor(
    private data: DataService,
    private actions$: Actions,
  ) { }
}
