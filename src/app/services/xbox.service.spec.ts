import { TestBed, inject } from '@angular/core/testing';

import { XboxService } from './xbox.service';

describe('XboxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XboxService]
    });
  });

  it('should ...', inject([XboxService], (service: XboxService) => {
    expect(service).toBeTruthy();
  }));
});
