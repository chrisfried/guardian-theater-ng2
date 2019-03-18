import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { gt } from '../gt.typings';

@Injectable()
export class MixerService {
  public mixer: {
    [key: string]: BehaviorSubject<gt.MixerServiceItem>;
  };

  constructor() {
    this.mixer = {};
  }
}
