import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrontPageComponent } from '../front-page/front-page.component';
import { AboutComponent } from '../about/about.component';
import { SettingsComponent } from '../settings/settings.component';
import { GuardianComponent } from '../guardian/guardian.component';
import { ActivityComponent } from '../activity/activity.component';

const appRoutes: Routes = [
  { path: 'activity/:membershipType/:activityId/:characterId/:clipId', component: ActivityComponent },
  { path: 'activity/:membershipType/:activityId', component: ActivityComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'guardian/:guardian/:membershipType/:characterId/:gamemode/:page', component: GuardianComponent },
  { path: 'guardian/:guardian/:membershipType/:characterId/:gamemode', component: GuardianComponent },
  { path: 'guardian/:guardian/:membershipType/:characterId', component: GuardianComponent },
  { path: 'guardian/:guardian/:membershipType', component: GuardianComponent },
  { path: 'guardian/:guardian', component: GuardianComponent },
  { path: '', component: FrontPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class RoutesModule { }