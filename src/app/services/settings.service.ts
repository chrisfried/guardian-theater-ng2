import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class SettingsService {
  private _clipLimiter: gt.ClipLimiter;

  public clipLimiter: BehaviorSubject<gt.ClipLimiter>;
  public activeName: BehaviorSubject<string>;
  public userLang: string;

  constructor() {
    this._clipLimiter = {
      self: true,
      fireteam: true,
      team: true,
      opponents: true
    };

    this.clipLimiter = new BehaviorSubject(this._clipLimiter);
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
    console.log(this.userLang);
  }

  set toggleLimit(limit) {
    this._clipLimiter[limit] = !this._clipLimiter[limit];
    this.clipLimiter.next(this._clipLimiter);
  }
}
