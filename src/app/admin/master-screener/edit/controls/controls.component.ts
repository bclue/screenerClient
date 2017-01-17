import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducer';
import * as editScreener from '../edit.actions';
import * as fromOverview from '../../master-screener.actions';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromPromise';

@Component({
  selector: 'app-edit-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class EditControlsComponent implements OnInit, OnDestroy {
  unsavedEdits$: Observable<boolean>;
  saving$: Observable<boolean>;
  version: number;
  subscription: Subscription;

  constructor(
    private store: Store<fromRoot.State>, 
    private route: ActivatedRoute,
    public dataService: DataService,
    private router: Router
  ){}

  ngOnInit() {
    this.version = this.route.snapshot.params['version'];
    this.unsavedEdits$ = this.store.let(fromRoot.unsavedEdits);
    this.saving$ = this.store.let(fromRoot.getEditScreenerSaving);
  }

  ngOnDestroy(){
    if(this.subscription !== undefined && !this.subscription.closed){
      this.subscription.unsubscribe();
    }
  }

  handleUndo() {
    this.store.dispatch( new editScreener.UndoEdit({}));
  }

  handleRedo() {
    this.store.dispatch( new editScreener.RedoEdit({}) );
  }

  handleClear() {
    this.store.dispatch( new editScreener.ClearQuestions({}));
  }

  handleSave() {
    this.subscription = this.store.let(fromRoot.getPresentEditScreener)
      .map(screener => {
        const updatedVersion = screener;
        if (updatedVersion.version) {
          updatedVersion.version += 1;
        } else {
          updatedVersion.version = 1;
        }
        
        if (updatedVersion.meta.screener.version) {
          updatedVersion.meta.screener.version += 1;
        } else {
          updatedVersion.meta.screener.version = 1;
        }
        return updatedVersion;
      })
      .switchMap(screener => Observable.fromPromise(this.dataService.saveScreener(screener)))
      .subscribe({
        next: response => {
          this.store.dispatch(new fromOverview.LoadScreeners([response]));
          this.router.navigateByUrl('/admin/master-screener/overview');
        },
        error: error => console.error(error)
      })
  }
}
