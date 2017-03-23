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
  public userLang: {
    language?: string
  };

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

    this.userLang = {
      language: 'en'
    };
    if (this.localStorageService.get('LANGUAGE')) {
      this.userLang = this.localStorageService.get('LANGUAGE');
    } else if (navigator.language) {
      switch (navigator.language.substr(0, 2)) {
        case 'de':
          this.userLang.language = 'de';
          break;
        case 'es':
          this.userLang.language = 'es';
          break;
        case 'fr':
          this.userLang.language = 'fr';
          break;
        case 'it':
          this.userLang.language = 'it';
          break;
        case 'ja':
          this.userLang.language = 'ja';
          break;
        case 'pt':
          this.userLang.language = 'ptbr';
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

  set setLanguage(language) {
    this.userLang.language = language;
    this.localStorageService.set('LANGUAGE', this.userLang);
  }
}
