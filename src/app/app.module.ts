import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageModule } from 'angular-2-local-storage';
import { AdsenseModule } from 'ng2-adsense';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

import { RoutesModule } from './routes/routes.module';

import { BungieHttpService } from './services/bungie-http.service';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { TwitchStampPipe } from './pipes/twitch-stamp.pipe';
import { TakeMyMoneyComponent } from './take-my-money/take-my-money.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FrontPageComponent,
    TwitchStampPipe,
    TakeMyMoneyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RoutesModule,
    LocalStorageModule.withConfig({
      prefix: 'gt',
      storageType: 'localStorage'
    }),
    AdsenseModule.forRoot({
      adClient: 'ca-pub-7822250090731539',
      adSlot: 9694174006
    }),
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics])
  ],
  providers: [
    BungieHttpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
