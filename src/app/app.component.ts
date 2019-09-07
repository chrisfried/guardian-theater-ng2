import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Component, Renderer2 } from '@angular/core';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private settingsService: SettingsService,
    private renderer: Renderer2
  ) {
    angulartics2GoogleAnalytics.startTracking();
    this.settingsService.dark.subscribe(dark => {
      dark
        ? this.renderer.addClass(document.body, 'dark')
        : this.renderer.removeClass(document.body, 'dark');
    });
  }
}
