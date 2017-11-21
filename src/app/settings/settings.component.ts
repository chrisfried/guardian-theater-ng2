import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private _subLinks: Subscription;

  public links: gt.Links;

  constructor(
    public settingsService: SettingsService,
    private location: Location
  ) { }

  ngOnInit() {
    this._subLinks = this.settingsService.links
      .subscribe(links => {
        this.links = links;
      });
  }

  ngOnDestroy() {
    this._subLinks.unsubscribe();
  }

  toggleActivityLink(link: string) {
    this.settingsService.toggleActivityLink = link;
  }

  toggleGuardianLink(link: string) {
    this.settingsService.toggleGuardianLink = link;
  }

  toggleXboxLink(link: string) {
    this.settingsService.toggleXboxLink = link;
  }

  setLanguage(language: string) {
    this.settingsService.setLanguage = language;
  }

  back() {
    this.location.back();
  }

}
