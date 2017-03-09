import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgcrComponent } from './pgcr.component';

describe('PgcrComponent', () => {
  let component: PgcrComponent;
  let fixture: ComponentFixture<PgcrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgcrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
