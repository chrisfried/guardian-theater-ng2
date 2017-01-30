/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GuardianService } from './guardian.service';

describe('GuardianService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GuardianService]
    });
  });

  it('should ...', inject([GuardianService], (service: GuardianService) => {
    expect(service).toBeTruthy();
  }));
});
