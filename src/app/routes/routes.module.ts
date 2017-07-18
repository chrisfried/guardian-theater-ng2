import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrontPageComponent } from '../front-page/front-page.component';
import { TakeMyMoneyComponent } from '../take-my-money/take-my-money.component';

const appRoutes: Routes = [
  { path: 'donate', component: TakeMyMoneyComponent },
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