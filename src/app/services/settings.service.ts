import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class SettingsService {
  private _clipLimiter: gt.ClipLimiter;

  public clipLimiter: BehaviorSubject<gt.ClipLimiter>;
  public activeName: BehaviorSubject<string>;

  constructor() {
    this._clipLimiter = {
      self: true,
      fireteam: true,
      team: true,
      opponents: true
    };

    this.clipLimiter = new BehaviorSubject(this._clipLimiter);
    this.activeName = new BehaviorSubject('');
  }

  set toggleLimit(limit) {
    this._clipLimiter[limit] = !this._clipLimiter[limit];
    this.clipLimiter.next(this._clipLimiter);
  }
}
