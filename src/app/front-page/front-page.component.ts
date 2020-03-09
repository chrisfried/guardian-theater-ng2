import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GtApiService, Instance } from 'app/services/gtApi.service';

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss']
})
export class FrontPageComponent implements OnInit, OnDestroy {
  private subs: Subscription[];
  loadingActivities: boolean;
  instances: Instance[];
  slicedInstances: Instance[];
  page = 0;

  constructor(private gtApiService: GtApiService) {}

  ngOnInit() {
    this.subs = [];
    this.loadingActivities = true;
    this.subs.push(
      this.gtApiService.getStreamerVsStreamer().subscribe(res => {
        this.loadingActivities = false;
        this.instances = res;
        this.slicedInstances = this.instances.slice(
          0 + this.page * 7,
          7 + this.page * 7
        );
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
