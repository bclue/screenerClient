import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterScreenerComponent } from './master-screener.component';
import { OverviewComponent } from './overview/overview.component';
import { routing } from './master-screener.routes';
import { ScreenerStatsComponent } from './overview/screener-stats/screener-stats.component';
import { OverviewControlsComponent } from './overview/controls/controls.component';
import { KeyComponent } from './overview/key/key.component';
import { OverviewQuestionComponent } from './overview/question/question.component';
import { EditComponent } from './edit/edit.component';
import { MdProgressCircleModule } from '@angular/material';
import { MdCheckboxModule } from '@angular/material';
import { MdCardModule } from '@angular/material';
import { MdButtonModule } from '@angular/material';
import { EditGuardService } from './edit/edit-guard.service';
import { EditControlsComponent } from './edit/controls/controls.component';
import { EditQuestionsComponent } from './edit/edit-questions/edit-questions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserFacingProgramModule } from '../../shared/modules/user-facing-program.module';
import { QuestionModule } from '../../shared/modules/question.module';
import { EditQuestionControlsComponent } from './edit/edit-question-controls/edit-question-controls.component';
import { BreadCrumbComponent } from '../core/bread-crumb/bread-crumb.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    MdProgressCircleModule.forRoot(),
    MdCheckboxModule.forRoot(),
    MdCardModule.forRoot(),
    MdButtonModule.forRoot(),
    ReactiveFormsModule,
    UserFacingProgramModule,
    QuestionModule
  ],
  declarations: [
    MasterScreenerComponent,
    OverviewComponent,
    ScreenerStatsComponent,
    OverviewControlsComponent,
    KeyComponent,
    OverviewQuestionComponent,
    EditComponent,
    EditControlsComponent,
    EditQuestionsComponent,
    EditQuestionControlsComponent,
    BreadCrumbComponent
  ],
  providers: [
    EditGuardService
  ]
})
export class MasterScreenerModule { }
