import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GuardianService } from '../guardian.service';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-guardian-activities',
  templateUrl: './guardian-activities.component.html',
  styleUrls: ['./guardian-activities.component.scss']
})
export class GuardianActivitiesComponent implements OnInit, OnDestroy {
  private subActiveCharacter: Subscription;
  private subActivities: Subscription;

  public activeCharacter: bungie.Character;
  public activities: bungie.Activity[];

  constructor(
    private guardianService: GuardianService
  ) { }

  ngOnInit() {
    this.subActiveCharacter = this.guardianService.activeCharacter
      .subscribe(character => {
        this.activeCharacter = character;
      });

    this.subActivities = this.guardianService.activities
      .subscribe(activities => {
        this.activities = activities;
      });
  }

  ngOnDestroy() {
    this.subActiveCharacter.unsubscribe();
    this.subActivities.unsubscribe();
  }

}
