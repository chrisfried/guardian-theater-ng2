import { Injectable } from '@angular/core';

@Injectable()
export class XboxService {
  public xbox: {};
  public xboxPC: {};

  constructor() {
    this.xbox = {};
    this.xboxPC = {};
  }
}
