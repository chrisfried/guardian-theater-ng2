import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { BungieHttpService } from '../services/bungie-http.service';
import { TwitchService } from '../services/twitch.service';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  providers: [
    ActivityService
  ]
})
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() activity: bungie.Activity;

  private subPGCR: Subscription;

  public pgcr: bungie.PostGameCarnageReport;

  constructor(
    private activityService: ActivityService,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService
  ) { }

  ngOnInit() {
    this.activityService.activity = this.activity;
    this.subPGCR = this.activityService.pgcr
      .subscribe((pgcr: bungie.PostGameCarnageReport) => this.pgcr = pgcr);
  }

  ngOnDestroy() {
    this.subPGCR.unsubscribe();
  }

}
