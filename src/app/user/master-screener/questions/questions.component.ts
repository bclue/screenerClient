import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup  } from '@angular/forms';
import { MasterScreenerService } from '../master-screener.service';
import { QuestionControlService } from './question-control.service';
import { Question } from '../../../shared';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  providers: [QuestionControlService]
})
export class QuestionsComponent implements OnInit {
  questions$: Observable<Question[]>;
  form: FormGroup;
  payLoad = '';


  constructor(
    private masterScreenerService: MasterScreenerService,
    private questionControlService: QuestionControlService,
    private router: Router
  ) { }

  ngOnInit() {
    this.questions$ = this.masterScreenerService.loadQuestions();
    this.loadForm();
  }


  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
    this.masterScreenerService.fetchResults(this.payLoad);
    this.router.navigateByUrl('/master-screener/results');
  }

  addControls(questions) {
    this.questionControlService.addQuestions(questions, this.form);
  }

  removeControls(questions) {
    this.questionControlService.removeQuestions(questions, this.form);
  }

  loadForm() {
    const sub = this.questionControlService.toFormGroup(this.questions$)
      .subscribe(
      (formGroup: FormGroup) => this.form = formGroup,
      (error: any) => console.log(`error ${error}`)
      );
   sub.unsubscribe();
  }
}
