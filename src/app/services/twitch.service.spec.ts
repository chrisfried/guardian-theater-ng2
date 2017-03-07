import { TestBed, inject } from '@angular/core/testing';

import { TwitchService } from './twitch.service';

describe('TwitchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TwitchService]
    });
  });

  it('should ...', inject([TwitchService], (service: TwitchService) => {
    expect(service).toBeTruthy();
  }));
});
