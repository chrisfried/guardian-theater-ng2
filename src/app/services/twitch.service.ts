import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { gt } from '../gt.typings';

@Injectable()
export class TwitchService {
  public twitch: {
    [key: string]: BehaviorSubject<gt.TwitchServiceItem>;
  };

  constructor() {
    this.twitch = {};
  }
}
