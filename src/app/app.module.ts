import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routing }  from './app.routes';
import { AppComponent } from './app.component';
import { MaterialModule } from '@angular/material';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { AboutComponent } from './user/about/about.component';
import { MasterScreenerModule } from './user/master-screener/master-screener.module';
import { BrowseModule } from './user/browse/browse.module';
import { HomeComponent } from './user/home/home.component';
import { MasterScreenerService } from './user/master-screener/master-screener.service';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    PageNotFoundComponent,
    AboutComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    MasterScreenerModule,
    BrowseModule, //browse programs not related to BrowserModule... i.e "browse benefit programs"
    routing,
    MaterialModule.forRoot()
  ],
  providers: [MasterScreenerService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
