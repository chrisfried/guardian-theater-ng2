import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { LocalStorageService } from 'angular-2-local-storage';

@Injectable()
export class SettingsService {
  private _clipLimiter: gt.ClipLimiter;
  private _links: gt.Links;

  public clipLimiter: BehaviorSubject<gt.ClipLimiter>;
  public links: BehaviorSubject<gt.Links>;
  public activeName: BehaviorSubject<string>;
  public userLang: string;

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this._clipLimiter = this.localStorageService.get('CLIP_LIMITER') || {
      self: true,
      fireteam: true,
      team: true,
      opponents: true,
      xbox: true,
      twitch: true
    };

    this._links = this.localStorageService.get('LINKS') || {
      activity: {
        bungie: false,
        tracker: false,
        ggg: false,
        trials: false
      },
      guardian: {
        bungie: false,
        twitch: false,
        tracker: false,
        ggg: false
      }
    };

    this.clipLimiter = new BehaviorSubject(this._clipLimiter);
    this.links = new BehaviorSubject(this._links);
    this.activeName = new BehaviorSubject('');

    this.userLang = 'en';
    if (navigator.language) {
      switch (navigator.language.substr(0, 2)) {
        case 'de':
          this.userLang = 'de';
          break;
        case 'es':
          this.userLang = 'es';
          break;
        case 'fr':
          this.userLang = 'fr';
          break;
        case 'it':
          this.userLang = 'it';
          break;
        case 'ja':
          this.userLang = 'ja';
          break;
        case 'pt':
          this.userLang = 'ptbr';
          break;
      }
    }
  }

  set toggleLimit(limit) {
    this._clipLimiter[limit] = !this._clipLimiter[limit];
    this.clipLimiter.next(this._clipLimiter);
    this.localStorageService.set('CLIP_LIMITER', this._clipLimiter);
  }

  set toggleGuardianLink(link) {
    this._links.guardian[link] = !this._links.guardian[link];
    this.links.next(this._links);
    this.localStorageService.set('LINKS', this._links);
  }

  set toggleActivityLink(link) {
    this._links.activity[link] = !this._links.activity[link];
    this.links.next(this._links);
    this.localStorageService.set('LINKS', this._links);
  }
}
