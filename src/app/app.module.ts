import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoutesModule } from './routes/routes.module';

import { BungieHttpService } from './services/bungie-http.service';
import { TwitchService } from './services/twitch.service';
import { MixerService } from './services/mixer.service';
import { XboxService } from './services/xbox.service';
import { SettingsService } from './services/settings.service';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { AboutComponent } from './about/about.component';
import { SettingsComponent } from './settings/settings.component';
import { GuardianComponent } from './guardian/guardian.component';
import {
  ActivityComponent,
  PgcrEntryComponent
} from './activity/activity.component';
import { DestinyHashPipe } from './pipes/destiny-hash.pipe';
import { TwitchStampPipe } from './pipes/twitch-stamp.pipe';
import { GtBadgePipe } from './pipes/gt-badge.pipe';
import { TakeMyMoneyComponent } from './take-my-money/take-my-money.component';
import { SearchComponent } from './search/search.component';
import { BungieStatusComponent } from './bungie-status/bungie-status.component';
import { PlatformAbbrPipe } from './pipes/platform-abbr.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ManifestService } from './services/manifest.service';
import { AuthComponent } from './auth/auth.component';
import { GtApiService } from './services/gtApi.service';
import { JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() {
  return localStorage.getItem('gtapi_access_token');
}

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
    PgcrEntryComponent,
    DestinyHashPipe,
    TakeMyMoneyComponent,
    SearchComponent,
    BungieStatusComponent,
    PlatformAbbrPipe,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: [
          'localhost:3000',
          'api.guardian.theater',
          'beta.guardian.theater'
        ],
        blacklistedRoutes: []
      }
    }),
    RoutesModule,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWithDelay:5000'
    }),
    FontAwesomeModule
  ],
  providers: [
    BungieHttpService,
    TwitchService,
    MixerService,
    XboxService,
    SettingsService,
    ManifestService,
    GtApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
