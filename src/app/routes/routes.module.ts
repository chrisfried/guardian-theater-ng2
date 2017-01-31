import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrontPageComponent } from '../front-page/front-page.component';
import { AboutComponent } from '../about/about.component';
import { SettingsComponent } from '../settings/settings.component';
import { GuardianComponent } from '../guardian/guardian.component';

const appRoutes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'guardian/:guardian/:platform/:character/:gamemode/:page', component: GuardianComponent },
  { path: 'guardian/:guardian/:platform/:character/:gamemode', component: GuardianComponent },
  { path: 'guardian/:guardian/:platform/:character', component: GuardianComponent },
  { path: 'guardian/:guardian/:platform', component: GuardianComponent },
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