import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageModule } from 'angular-2-local-storage';
import { AdsenseModule } from 'ng2-adsense';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

import { RoutesModule } from './routes/routes.module';

import { BungieHttpService } from './services/bungie-http.service';
import { TwitchService } from './services/twitch.service';
import { XboxService } from './services/xbox.service';
import { SettingsService } from './services/settings.service';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { AboutComponent } from './about/about.component';
import { SettingsComponent } from './settings/settings.component';
import { GuardianComponent } from './guardian/guardian.component';
import { ActivityComponent } from './activity/activity.component';
import { DestinyHashPipe } from './pipes/destiny-hash.pipe';
import { TwitchStampPipe } from './pipes/twitch-stamp.pipe';
import { GtBadgePipe } from './pipes/gt-badge.pipe';
import { TakeMyMoneyComponent } from './take-my-money/take-my-money.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FrontPageComponent,
    AboutComponent,
    SettingsComponent,
    GuardianComponent,
    TwitchStampPipe,
    GtBadgePipe,
    ActivityComponent,
    DestinyHashPipe,
    TakeMyMoneyComponent,
    SearchComponent
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
    BungieHttpService,
    TwitchService,
    XboxService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
