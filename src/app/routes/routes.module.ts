import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrontPageComponent } from '../front-page/front-page.component';
import { ConsoleComponent } from '../console/console.component';
import { AboutComponent } from '../about/about.component';
import { SettingsComponent } from '../settings/settings.component';
import { PlayerPageComponent } from '../player-page/player-page.component';
import { ClipPageComponent } from '../clip-page/clip-page.component';

const appRoutes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'about', component: AboutComponent },
  {
    path: ':id', component: ConsoleComponent,
    children: [
      {
        path: 'player',
        component: PlayerPageComponent
      },
      {
        path: 'clip',
        component: ClipPageComponent
      }
    ]
  },
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