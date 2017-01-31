import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardianService } from '../guardian.service';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-guardian-activities',
  templateUrl: './guardian-activities.component.html',
  styleUrls: ['./guardian-activities.component.scss']
})
export class GuardianActivitiesComponent implements OnInit, OnDestroy {
  private _activitiesResults: Subscription;
  public activities: bungie.Activity[];

  constructor(
    private guardianService: GuardianService
  ) { }

  ngOnInit() {
    this._activitiesResults = this.guardianService.activitiesResults
      .subscribe(res => {
        this.activities = res.Response.data.activities;
      });
  }

  ngOnDestroy() {
    this._activitiesResults.unsubscribe();
  }

}
