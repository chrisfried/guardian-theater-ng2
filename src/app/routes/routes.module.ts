import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrontPageComponent } from '../front-page/front-page.component';
import { AboutComponent } from '../about/about.component';
import { SettingsComponent } from '../settings/settings.component';
import { GuardianComponent } from '../guardian/guardian.component';
import { SearchComponent } from '../search/search.component';
import { ActivityComponent } from '../activity/activity.component';
import { TakeMyMoneyComponent } from '../take-my-money/take-my-money.component';
import { AuthComponent } from 'app/auth/auth.component';

const appRoutes: Routes = [
  {
    path: 'activity/:activityId/:clipId',
    component: ActivityComponent
  },
  {
    path: 'activity/:activityId',
    component: ActivityComponent
  },
  { path: 'settings', component: SettingsComponent },
  { path: 'login/success/:jwt', component: AuthComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'about', component: AboutComponent },
  { path: 'donate', component: TakeMyMoneyComponent },
  { path: 'search/:guardian', component: SearchComponent },
  {
    path: 'guardian/:membershipType/:membershipId',
    component: GuardianComponent
  },
  { path: '', component: FrontPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class RoutesModule {}
