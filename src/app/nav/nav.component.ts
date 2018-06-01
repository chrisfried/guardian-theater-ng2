import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { BungieHttpService } from '../services/bungie-http.service';
import { Subscription } from 'rxjs/Subscription';
import { ServerResponse } from 'bungie-api-ts/destiny2';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  public searchString: string;
  public ad: boolean;
  private adInterval;
  private adTimeout;
  public betaTextHidden: {
    hidden?: boolean
  };
  public errorRes: ServerResponse<any>;
  private _errorRes$: Subscription;
  private _routerEvent$: Subscription;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private bHttp: BungieHttpService
  ) {}

  ngOnInit() {
    this._routerEvent$ = this.router.events
      .subscribe((event: Event) => {
        this.errorRes = null;
      });
    this._errorRes$ = this.bHttp.error.subscribe(res => this.errorRes = res);
    this.searchString = '';
    this.ad = true;
    this.adInterval = setInterval(() => {
      if (window.innerWidth > 704) {
        this.ad = false;
        this.adTimeout = setTimeout(() => {
          this.ad = true;
        }, 50);
      }
    }, 30000)

    this.betaTextHidden = this.localStorageService.get('hideBetaText') || { hidden: false };
  }

  ngOnDestroy() {
    this._routerEvent$.unsubscribe();
    this._errorRes$.unsubscribe();
    clearInterval(this.adInterval);
    clearTimeout(this.adTimeout);
  }

  search() {
    if (this.searchString.length) {
      this.router.navigate(['/guardian', this.searchString]);
    }
  }

  route(route: any[]) {
    this.router.navigate(route);
  }

  // hideBetaText() {
  //   this.betaTextHidden.hidden = true;
  //   this.localStorageService.set('hideBetaText', this.betaTextHidden);
  // }

}
