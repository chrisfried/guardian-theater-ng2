import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeMyMoneyComponent } from './take-my-money.component';

describe('TakeMyMoneyComponent', () => {
  let component: TakeMyMoneyComponent;
  let fixture: ComponentFixture<TakeMyMoneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeMyMoneyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeMyMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
