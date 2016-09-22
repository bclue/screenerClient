import { Component, OnInit } from '@angular/core';
import { BrowseService } from './browse.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css'],
  providers: [ BrowseService ]
})
export class BrowseComponent implements OnInit {
  categories$: Observable<string[]>;
  initialCategory: string;
  constructor(
    private browseService: BrowseService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const category = this.extractCategoryFromRoute();
    if ( category !== false) {
      this.initialCategory = <string>category;
    } else {
      this.initialCategory = 'undefined';
    }

    this.categories$ = this.browseService.getCategories();
  }


  selectChange($event) {
    const category = $event.target.value;
    this.router.navigate([`/browse-programs/${category}`]);
  }

  extractCategoryFromRoute(): string | boolean {
    let category = null;
    // i'm scared
    if ( this.router.routerState.snapshot.url ) {
      category = this.router.routerState.snapshot.url.split('/')[2];
    }
    if (category) {
      return category;
    }
    return false;
  }
}
