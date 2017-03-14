import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageModule } from 'angular-2-local-storage';

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
import { ClassHashPipe, RaceHashPipe, ActivityModePipe, ActivityNamePipe } from './bungie-pipes.pipe';
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
    ClassHashPipe, RaceHashPipe, ActivityModePipe, ActivityNamePipe,
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
