import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { RoutesModule } from './routes/routes.module';

import { BungieHttpService } from './services/bungie-http.service';
import { TwitchService } from './services/twitch.service';
import { XboxService } from './services/xbox.service';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { AboutComponent } from './about/about.component';
import { SettingsComponent } from './settings/settings.component';
import { GuardianComponent } from './guardian/guardian.component';
import { ClassTypePipe, RaceHashPipe, ActivityModePipe } from './bungie-pipes.pipe';
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
    ClassTypePipe, RaceHashPipe, ActivityModePipe,
    ActivityComponent,
    PgcrComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RoutesModule
  ],
  providers: [
    BungieHttpService,
    TwitchService,
    XboxService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
