import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramsComponent } from './programs.component';
import { ProgramOverviewComponent } from './program-overview/program-overview.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { AdminCoreModule } from '../core/admin-core.module';
import { ProgramDetailComponent } from './program-overview/program-detail/program-detail.component';
import { ProgramOverviewGuardService } from './program-overview/route-guard';
import { ProgramDetailControlComponent } from './program-overview/program-detail-control/program-detail-control.component';
import { OverviewControlsComponent } from './program-overview/overview-controls/overview-controls.component';
import { ProgramEditComponent } from './program-edit/program-edit.component';
import { ProgramEditGuardService } from './program-edit/route-guard';
import { DeleteConfirmationComponent } from './program-overview/delete-confirmation/delete-confirmation.component';
import { ProgramDeleteGuardService } from './program-overview/delete-confirmation/route-guard';
import { ApplicationSideComponent } from './program-edit/application-side/application-side.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule.forRoot(),
    ReactiveFormsModule,
    AdminCoreModule
  ],
  declarations: [
    ProgramsComponent,
    ProgramOverviewComponent,
    ProgramDetailComponent,
    ProgramDetailControlComponent,
    OverviewControlsComponent,
    ProgramEditComponent,
    DeleteConfirmationComponent,
    ApplicationSideComponent
  ],
  providers: [
    ProgramOverviewGuardService,
    ProgramEditGuardService,
    ProgramDeleteGuardService
  ]
})
export class ProgramsModule { }
