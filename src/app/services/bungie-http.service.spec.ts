/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BungieHttpService } from './bungie-http.service';

describe('BungieHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BungieHttpService]
    });
  });

  it('should ...', inject([BungieHttpService], (service: BungieHttpService) => {
    expect(service).toBeTruthy();
  }));
});
