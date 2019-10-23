import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
  public userLangObs: BehaviorSubject<{
    language?: string;
  }>;
  public dark: BehaviorSubject<boolean>;

  constructor() {
    this._clipLimiter = JSON.parse(localStorage.getItem('gt.CLIP_LIMITER')) || {
      self: true,
      fireteam: true,
      team: true,
      opponents: true
    };

    this._links = JSON.parse(localStorage.getItem('gt.LINKS')) || {};

    if (localStorage.getItem('gt.DARK') !== null) {
      this._dark = JSON.parse(localStorage.getItem('gt.DARK')) || false;
    } else {
      this._dark = true;
    }

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
    if (JSON.parse(localStorage.getItem('gt.LANGUAGE'))) {
      this.userLang = JSON.parse(localStorage.getItem('gt.LANGUAGE'));
    } else if (navigator.language) {
      switch (navigator.language.substr(0, 2)) {
        case 'fr':
          this.userLang.language = 'fr';
          break;
        case 'es':
          this.userLang.language = 'es';
          break;
        case 'de':
          this.userLang.language = 'de';
          break;
        case 'it':
          this.userLang.language = 'it';
          break;
        case 'ja':
          this.userLang.language = 'ja';
          break;
        case 'pt':
          this.userLang.language = 'pt-br';
          break;
        case 'ru':
          this.userLang.language = 'ru';
          break;
        case 'pl':
          this.userLang.language = 'pl';
          break;
        case 'ko':
          this.userLang.language = 'pl';
          break;
        case 'zh':
          this.userLang.language = 'zh-cht';
          break;
      }
      switch (navigator.language) {
        case 'es-mx':
          this.userLang.language = 'es-mx';
          break;
        case 'zh-chs':
          this.userLang.language = 'zh-chs';
          break;
      }
    }
    this.userLangObs = new BehaviorSubject(this.userLang);
  }

  set toggleLimit(limit) {
    this._clipLimiter[limit] = !this._clipLimiter[limit];
    this.clipLimiter.next(this._clipLimiter);
    localStorage.setItem('gt.CLIP_LIMITER', JSON.stringify(this._clipLimiter));
  }

  set toggleGuardianLink(link) {
    this._links.guardian[link] = !this._links.guardian[link];
    this.links.next(this._links);
    localStorage.setItem('gt.LINKS', JSON.stringify(this._links));
  }

  set toggleActivityLink(link) {
    this._links.activity[link] = !this._links.activity[link];
    this.links.next(this._links);
    localStorage.setItem('gt.LINKS', JSON.stringify(this._links));
  }

  set toggleXboxLink(link) {
    this._links.xbox[link] = !this._links.xbox[link];
    this.links.next(this._links);
    localStorage.setItem('gt.LINKS', JSON.stringify(this._links));
  }

  toggleDark() {
    this._dark = !this._dark;
    this.dark.next(this._dark);
    localStorage.setItem('gt.DARK', JSON.stringify(this._dark));
  }

  set setLanguage(language) {
    this.userLang.language = language;
    localStorage.setItem('gt.LANGUAGE', JSON.stringify(this.userLang));
    this.userLangObs.next(this.userLang);
  }
}
