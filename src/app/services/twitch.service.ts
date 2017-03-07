import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class TwitchService {
  public twitchIds: BehaviorSubject<any>;

  constructor() {
    this.twitchIds = new BehaviorSubject({
      Placeholder: 0
    });
  }

}
