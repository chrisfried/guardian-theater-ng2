import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { Subscription } from 'rxjs';
import { gt } from '../gt.typings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private _subLinks: Subscription;
  private _subDark: Subscription;

  public links: gt.Links;
  public dark: boolean;

  constructor(
    public settingsService: SettingsService,
    private location: Location
  ) {}

  ngOnInit() {
    this._subLinks = this.settingsService.links.subscribe(links => {
      this.links = links;
    });
    this._subDark = this.settingsService.dark.subscribe(
      dark => (this.dark = dark)
    );
  }

  ngOnDestroy() {
    this._subLinks.unsubscribe();
    this._subDark.unsubscribe();
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

  toggleDark() {
    this.settingsService.toggleDark();
  }

  setLanguage(language: string) {
    this.settingsService.setLanguage = language;
  }

  back() {
    this.location.back();
  }
}
