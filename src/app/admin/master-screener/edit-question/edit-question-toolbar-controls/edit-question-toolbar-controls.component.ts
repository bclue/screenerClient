import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducer';
import * as editQuestion from '../edit-question.actions';
import * as editScreener from '../../edit/edit.actions';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-edit-question-toolbar-controls',
  templateUrl: './edit-question-toolbar-controls.component.html',
  styleUrls: ['./edit-question-toolbar-controls.component.css']
})
export class EditQuestionToolbarControlsComponent implements OnInit {
  workingEditVersion$: Observable<number>;
  unsavedEdits$: Observable<boolean>;
  constructor(private store: Store<fromRoot.State>, private router: Router) { }

  ngOnInit() {
    this.workingEditVersion$ = this.store.let(fromRoot.getPresentEditScreenerVersion);
    this.unsavedEdits$ = this.store.let(fromRoot.unsavedQuestionEdits);
  }

  handleUndo() {
    this.store.dispatch(new editQuestion.UndoEdit({}));
  }

  handleRedo() {
    this.store.dispatch(new editQuestion.RedoEdit({}));
  }

  handleSave() {
    Observable.combineLatest(
      this.store.let(fromRoot.getPresentQuestionEdit).take(1),
      this.store.let(fromRoot.getOriginalKeyQuestionEdit).take(1),
      this.store.let(fromRoot.getWorkingNumber).take(1)
    )
    .subscribe(
      ([presentQuestionState, key, currentVersion]) => {
        if (key === 'new') {
          this.store.dispatch(new editScreener.AddQuestion(presentQuestionState.question));
        } else {
          this.store.dispatch(new editScreener.EditQuestion({
              originalKey: key,
              editedVersion: presentQuestionState.question
            })
          );
        }
        this.router.navigateByUrl(`/admin/master-screener/edit/version/${currentVersion}`);
      },
      (error) => console.log(error)
    );
  }

  checkIfUndefined(value: any) {
    if (typeof value === 'undefined') {
      this.router.navigateByUrl('/admin/master-screener/overview');
    }
  }
}
