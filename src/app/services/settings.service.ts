import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from 'angular-2-local-storage';
import { gt } from '../gt.typings';
import { UserInfoCard } from 'bungie-api-ts/user';

@Injectable()
export class SettingsService {
  private _clipLimiter: gt.ClipLimiter;
  private _links: gt.Links;
  private _dark: boolean;

  public clipLimiter: BehaviorSubject<gt.ClipLimiter>;
  public links: BehaviorSubject<gt.Links>;
  public activeProfiles: BehaviorSubject<UserInfoCard[]>;
  public userLang: {
    language?: string;
  };
  public dark: BehaviorSubject<boolean>;

  constructor(private localStorageService: LocalStorageService) {
    this._clipLimiter = this.localStorageService.get('CLIP_LIMITER') || {
      self: true,
      fireteam: true,
      team: true,
      opponents: true,
      xbox: true,
      twitch: true
    };

    this._links = this.localStorageService.get('LINKS') || {};

    this._dark = this.localStorageService.get('DARK') || false;

    if (!this._links.activity) {
      this._links.activity = {
        bungie: false,
        tracker: false,
        ggg: false,
        trials: false,
        options: true
      };
    }

    if (!this._links.guardian) {
      this._links.guardian = {
        bungie: false,
        twitch: true,
        mixer: true,
        tracker: false,
        ggg: false,
        options: false,
        platform: false
      };
    }

    if (!this._links.xbox) {
      this._links.xbox = {
        recordus: false,
        dvr: false,
        clips: false,
        gamedtv: false,
        xbox: true,
        download: true,
        options: false
      };
    }

    this.clipLimiter = new BehaviorSubject(this._clipLimiter);
    this.links = new BehaviorSubject(this._links);
    this.activeProfiles = new BehaviorSubject([]);
    this.dark = new BehaviorSubject(this._dark);

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
        case 'pl':
          this.userLang.language = 'pl';
          break;
        case 'pt':
          this.userLang.language = 'ptbr';
          break;
        case 'ru':
          this.userLang.language = 'ru';
          break;
        case 'zh':
          this.userLang.language = 'zhcht';
          break;
      }
      if (navigator.language === 'es-mx') {
        this.userLang.language = 'esmx';
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

  set toggleXboxLink(link) {
    this._links.xbox[link] = !this._links.xbox[link];
    this.links.next(this._links);
    this.localStorageService.set('LINKS', this._links);
  }

  toggleDark() {
    this._dark = !this._dark;
    this.dark.next(this._dark);
    this.localStorageService.set('DARK', this._dark);
  }

  set setLanguage(language) {
    this.userLang.language = language;
    this.localStorageService.set('LANGUAGE', this.userLang);
  }
}
