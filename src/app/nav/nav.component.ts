import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event } from '@angular/router';
import { BungieHttpService } from '../services/bungie-http.service';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { ServerResponse } from 'bungie-api-ts/destiny2';
import { SettingsService } from '../services/settings.service';
import { AuthService } from 'app/services/auth.service';
import { map, take } from 'rxjs/operators';
import { UserMembershipData } from 'bungie-api-ts/user';
import { faTshirt, faCoffee, faInfoCircle, faWrench } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  faInfoCircle = faInfoCircle;
  faWrench = faWrench;
  faCoffee = faCoffee;
  faTshirt = faTshirt;
  faDiscord = faDiscord;
  faTwitter = faTwitter;
  faGithub = faGithub;
  public searchString: string;
  public ad: boolean;
  public betaTextHidden: {
    hidden?: boolean;
  };
  public errorRes: ServerResponse<any>;
  public dark: boolean;
  public currentMemberId: BehaviorSubject<string>;

  private _errorRes$: Subscription;
  private _routerEvent$: Subscription;

  constructor(
    private settingsService: SettingsService,
    private router: Router,
    private bHttp: BungieHttpService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentMemberId = new BehaviorSubject('');
    this.login(false);

    this.searchString = localStorage.getItem('gt.LAST_SEARCH') || '';

    this.settingsService.dark.subscribe(dark => (this.dark = dark));
    this._routerEvent$ = this.router.events.subscribe((event: Event) => {
      this.errorRes = null;
      this.login(false);
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

  login(force: boolean) {
    this.authService.getCurrentMemberId(force).pipe(take(1), map((memberId: string) => {
      this.currentMemberId.next(memberId);
    })).subscribe()
  }

  getMembershipsForCurrentUser(): Observable<ServerResponse<UserMembershipData>> {
    const url = `https://stats.bungie.net/Platform/User/GetMembershipsForCurrentUser/`;
    return this.bHttp.get(url);
  }

  logout() {
    this.authService.signOut();
    this.currentMemberId.next('');
    this.login(false);
  }

  currentProfile() {
    this.getMembershipsForCurrentUser().subscribe(res => {
      try {
        this.router.navigate(
          [
            '/guardian',
            res.Response.destinyMemberships[0].membershipType,
            res.Response.destinyMemberships[0].membershipId,
            'None',
            0
          ]
        );
      } catch (e) {}
    })
  }
}
