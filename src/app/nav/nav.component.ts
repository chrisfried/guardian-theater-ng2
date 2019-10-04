import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event } from '@angular/router';
import { BungieHttpService } from '../services/bungie-http.service';
import { Subscription } from 'rxjs';
import { ServerResponse } from 'bungie-api-ts/destiny2';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  public searchString: string;
  public ad: boolean;
  public betaTextHidden: {
    hidden?: boolean;
  };
  public errorRes: ServerResponse<any>;
  public dark: boolean;
  private _errorRes$: Subscription;
  private _routerEvent$: Subscription;

  constructor(private settingsService: SettingsService, private router: Router, private bHttp: BungieHttpService) {
  }

  ngOnInit() {
    this.searchString = localStorage.getItem('gt.LAST_SEARCH') || '';

    this.settingsService.dark.subscribe(dark => this.dark = dark)
    this._routerEvent$ = this.router.events.subscribe((event: Event) => {
      this.errorRes = null;
    });
    this._errorRes$ = this.bHttp.error.subscribe(res => (this.errorRes = res));

    this.betaTextHidden = JSON.parse(
      localStorage.getItem('gt.hideBetaText')
    ) || {
      hidden: false
    };
  }

  ngOnDestroy() {
    this._routerEvent$.unsubscribe();
    this._errorRes$.unsubscribe();
  }

  search() {
    if (this.searchString.length) {
      this.router.navigate(['/guardian', this.searchString]);
    }
  }

  route(route: any[]) {
    this.router.navigate(route);
  }

  hideBetaText() {
    this.betaTextHidden.hidden = true;
    localStorage.setItem(
      'gt.hideBetaText',
      JSON.stringify(this.betaTextHidden)
    );
  }
}
