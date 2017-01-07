import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { RoutesModule } from './routes/routes.module';

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { PlayerPageComponent } from './player-page/player-page.component';
import { ClipPageComponent } from './clip-page/clip-page.component';
import { ConsoleComponent } from './console/console.component';
import { AboutComponent } from './about/about.component';
import { SettingsComponent } from './settings/settings.component';

import { SearchService } from './search.service';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    FrontPageComponent,
    PlayerPageComponent,
    ClipPageComponent,
    ConsoleComponent,
    AboutComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RoutesModule
  ],
  providers: [SearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
