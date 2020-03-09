import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserInfoCard } from 'bungie-api-ts/user';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { gt } from '../gt.typings';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';
import { ManifestService } from 'app/services/manifest.service';
import { GtApiService, Instance } from 'app/services/gtApi.service';

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
  public profiles: UserInfoCard[];
  public displayTag: string;
  public activities: gt.Activity[];
  public instances: Instance[];
  public slicedInstances: Instance[];
  public gamemode: string;
  public page: number;
  public clipLimiter: gt.ClipLimiter;
  public loadingActivities: boolean;
  public loadingAccounts: boolean;
  public emblemHash: number;
  public modeFilters: {
    name: string;
    flag: string;
    icon: string;
  }[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public guardianService: GuardianService,
    private settingsService: SettingsService,
    private manifestService: ManifestService,
    private gtApiService: GtApiService
  ) {
    this.manifestService.state$
      .pipe(
        map(state => {
          if (state.loaded) {
            this.modeFilters = [
              {
                flag: 'None',
                name: this.manifestService.defs.ActivityMode.get(0)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(0)
                    .displayProperties.icon
                }`
              },
              {
                flag: 'AllPvE',
                name: this.manifestService.defs.ActivityMode.get(7)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(7)
                    .displayProperties.icon
                }`
              },
              {
                flag: 'AllPvP',
                name: this.manifestService.defs.ActivityMode.get(5)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(5)
                    .displayProperties.icon
                }`
              },
              {
                flag: 'AllPvECompetitive',
                name: this.manifestService.defs.ActivityMode.get(64)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(63)
                    .displayProperties.icon
                }`
              }
            ];
          }
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.instances = [];
    this.slicedInstances = [];
    this.subs = [];

    this.subs.push(
      this.activatedRoute.params.subscribe((params: Params) => {
        if (this.membershipId !== params['membershipId']) {
          this.profiles = null;
          this.emblemHash = null;
        }
        this.membershipType = params['membershipType']
          ? +params['membershipType']
          : -1;
        this.membershipId = params['membershipId']
          ? params['membershipId']
          : '';
        this.gamemode = params['gamemode'] ? params['gamemode'] : 'None';
        this.page = params['page'] ? +params['page'] : 0;
        if (this.instances) {
          this.slicedInstances = this.instances.slice(
            0 + this.page * 7,
            7 + this.page * 7
          );
        }

        if (this.membershipType && this.membershipId) {
          this.loadingAccounts = true;
          this.subs.push(
            this.guardianService
              .getLinkedAccounts(
                +params['membershipType'],
                params['membershipId']
              )
              .subscribe(res => {
                this.loadingAccounts = false;
                this.settingsService.activeProfiles.next(res.Response.profiles);
              })
          );

          this.subs.push(
            this.guardianService
              .getEmblemHash(+params['membershipType'], params['membershipId'])
              .subscribe(res => {
                this.emblemHash = res;
              })
          );

          this.loadingActivities = true;
          this.subs.push(
            this.gtApiService
              .getEncounteredClips(this.membershipType, this.membershipId)
              .subscribe(res => {
                this.loadingActivities = false;
                this.instances = res.instances;
                this.slicedInstances = this.instances.slice(
                  0 + this.page * 7,
                  7 + this.page * 7
                );
              })
            // this.gtApiService.getStreamerVsStreamer().subscribe(res => {
            //   this.loadingActivities = false;
            //   this.instances = res;
            //   this.slicedInstances = this.instances.slice(
            //     0 + this.page * 7,
            //     7 + this.page * 7
            //   );
            // })
          );
        }
      })
    );

    this.subs.push(
      this.settingsService.activeProfiles.subscribe(
        profiles => (this.profiles = profiles)
      )
    );

    this.subs.push(
      this.settingsService.clipLimiter.subscribe(limiter => {
        this.clipLimiter = limiter;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.settingsService.activeProfiles.next([]);
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

  nextPage(toTop?: boolean) {
    if (this.page < this.instances.length / 7 - 1) {
      this.router.navigate([
        '/guardian',
        this.membershipType,
        this.membershipId,
        this.gamemode,
        this.page + 1
      ]);
      if (toTop) {
        window.scroll(0, 0);
      }
    }
  }

  prevPage(toTop?: boolean) {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian',
        this.membershipType,
        this.membershipId,
        this.gamemode,
        this.page - 1
      ]);
      if (toTop) {
        window.scroll(0, 0);
      }
    }
  }

  toggleLimiter(limit: string) {
    this.settingsService.toggleLimit = limit;
  }
}
