import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GeneralUser } from 'bungie-api-ts/user';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { gt } from '../gt.typings';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.component.html',
  styleUrls: ['./guardian.component.scss'],
  providers: [GuardianService]
})
export class GuardianComponent implements OnInit, OnDestroy {
  private subs: Subscription[];

  public membershipType: number;
  public membershipId: string;
  public displayName: string;
  public displayTag: string;
  public searchResults: GeneralUser[];
  public activities: gt.Activity[];
  public gamemode: string;
  public page: number;
  public clipLimiter: gt.ClipLimiter;
  public loadingActivities: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public guardianService: GuardianService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    // TO DO: If membershipType !== 1, 2, or 4, redirect to search.
    this.subs = [];

    this.subs.push(
      this.activatedRoute.params.subscribe((params: Params) => {
        this.membershipType = params['membershipType']
          ? +params['membershipType']
          : -1;
        this.membershipId = params['membershipId']
          ? params['membershipId']
          : '';
        this.gamemode = params['gamemode'] ? params['gamemode'] : 'None';
        this.page = params['page'] ? +params['page'] : 0;

        if (
          !(
            this.membershipType === 1 ||
            this.membershipType === 2 ||
            this.membershipType === 4
          )
        ) {
          this.router.navigate(['/search', this.membershipType], {
            replaceUrl: true
          });
        }

        if (this.membershipType && this.membershipId) {
          this.subs.push(
            this.guardianService
              .getLinkedAccounts(
                +params['membershipType'],
                params['membershipId']
              )
              .subscribe(res => {
                this.settingsService.activeProfiles.next(res.Response.profiles);
              })
          );

          this.loadingActivities = true;
          this.subs.push(
            this.guardianService
              .getActivitiesForAccount(
                this.membershipType,
                this.membershipId,
                this.gamemode
              )
              .pipe(map(res => res.slice(0 + this.page * 7, 7 + this.page * 7)))
              .subscribe(res => {
                this.loadingActivities = false;
                this.activities = res;
              })
          );
        }
      })
    );

    this.subs.push(
      this.settingsService.activeProfiles.subscribe(profiles => {
        this.displayName = '';
        profiles.forEach(profile => {
          this.displayName.length
            ? (this.displayName += ' // ')
            : (this.displayName += '');
          this.displayName += profile.displayName;
        });
      })
    );

    this.subs.push(
      this.settingsService.clipLimiter.subscribe(limiter => {
        this.clipLimiter = limiter;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  selectGamemode(gamemode: string) {
    this.router.navigate([
      '/guardian',
      this.membershipType,
      this.membershipId,
      gamemode,
      0
    ]);
  }

  nextPage() {
    this.router.navigate([
      '/guardian',
      this.membershipType,
      this.membershipId,
      this.gamemode,
      this.page + 1
    ]);
  }

  prevPage() {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian',
        this.membershipType,
        this.membershipId,
        this.gamemode,
        this.page - 1
      ]);
    }
  }

  toggleLimiter(limit: string) {
    this.settingsService.toggleLimit = limit;
  }
}
