import {
  throwError as observableThrowError,
  Observable,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BungieHttpService } from '../services/bungie-http.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-bungie-status',
  templateUrl: './bungie-status.component.html',
  styleUrls: ['./bungie-status.component.scss']
})
export class BungieStatusComponent implements OnInit {
  public bungieSub: Subscription;
  public bungieStatus: BehaviorSubject<{}[]>;

  constructor(private bHttp: BungieHttpService) {}

  ngOnInit() {
    this.bungieStatus = new BehaviorSubject([]);
    this.bungieSub = this.bHttp
      .get('https://www.bungie.net/Platform/GlobalAlerts/')
      .subscribe(res => {
        try {
          this.bungieStatus.next(res.Response);
        } catch (e) {}
      });
  }
}
