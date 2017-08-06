import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AuthService } from './admin/core/services/auth.service';
import { AuthGuardService } from './admin/core/services/auth-guard.service'
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/multicast';


@Component({
  selector: 'app-root',
  template: `
    <app-toolbar></app-toolbar>
    <main id="main-outlet" [ngClass]="backgroundClass">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      #main-outlet {
        min-height: 94vh;
        width: 98vw;
        margin: 0 auto;
      }
    `,
    `
      .background {
        background-image: url(assets/17_03_15-YouCanBenefit-Illustration.svg);
        background-position: center bottom;
        background-repeat: no-repeat;
        background-size: contain;
      }
    `,
    `
      @media(max-width: 600px) {
        .background {
          background-image: url(assets/17_03_15-YouCanBenefit-Illustration.svg);
          background-position: center center;
          background-repeat: no-repeat;
          background-size: cover;
        }
      }
    `,
    `
      .backgroundcolor {
        background-color: lightgoldenrodyellow;
      }
    `

  ],
  providers: [ ]
})
export class AppComponent implements OnInit {
  isIE: boolean;
  backgroundClass = {
    background: true,
    backgroundcolor: false 
  };

  constructor(private router: Router){}

  ngOnInit() {

    const userAgent: string = window ? window.navigator.userAgent: '';
    this.isIE = userAgent.includes('Trident');

    const isAdminRoute = url => url.substring(0, 7) === '/admin/';

    this.router.events
      .map(event => event instanceof NavigationEnd ? this.router.url : undefined)
      .filter(url => url !== undefined)
      .debounceTime(60)
      .map( url => isAdminRoute(url) )
      .subscribe( val => {
        if (this.isIE) {
            this.backgroundClass.background = false;
            this.backgroundClass.backgroundcolor = true;
        } else {
            this.backgroundClass.background = !val;
            this.backgroundClass.backgroundcolor = val;
        }


      });
  }
}
