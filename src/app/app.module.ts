import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageModule } from 'angular-2-local-storage';
import { AdsenseModule } from 'ng2-adsense';

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
import { ClassHashPipe, RaceHashPipe, ActivityModePipe, ActivityNamePipe, TwitchStampPipe } from './bungie-pipes.pipe';
import { ActivityComponent } from './activity/activity.component';
import { PgcrComponent } from './activity/pgcr/pgcr.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FrontPageComponent,
    AboutComponent,
    SettingsComponent,
    GuardianComponent,
    ClassHashPipe, RaceHashPipe, ActivityModePipe, ActivityNamePipe, TwitchStampPipe,
    ActivityComponent,
    PgcrComponent
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
    })
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
