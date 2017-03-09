import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class SettingsService {
  private _clipLimiter: gt.ClipLimiter;

  public clipLimiter: BehaviorSubject<gt.ClipLimiter>;

  constructor() {
    this._clipLimiter = {
      self: true,
      fireteam: true,
      team: true,
      oponents: true
    };

    this.clipLimiter = new BehaviorSubject(this._clipLimiter);
  }

  set toggleLimit(limit) {
    this._clipLimiter[limit] = !this._clipLimiter[limit];
    this.clipLimiter.next(this._clipLimiter);
  }
}
