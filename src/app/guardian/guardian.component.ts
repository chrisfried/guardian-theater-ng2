import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserInfoCard } from 'bungie-api-ts/user';
import { Subscription, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { gt } from '../gt.typings';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';
import { ManifestService } from 'app/services/manifest.service';
import { GtApiService, Instance } from 'app/services/gtApi.service';
import { DestinyActivityModeCategory } from 'bungie-api-ts/destiny2';

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
  public instances: BehaviorSubject<Instance[]>;
  public filteredInstances: Observable<Instance[]>;
  public slicedInstances: Observable<Instance[]>;
  public gamemode: string;
  public page: BehaviorSubject<number>;
  public clipLimiter: gt.ClipLimiter;
  public loadingActivities: boolean;
  public loadingAccounts: boolean;
  public emblemHash: number;
  public modeFilters: {
    name: string;
    category: DestinyActivityModeCategory;
    icon: string;
  }[];
  public modeFilter: BehaviorSubject<DestinyActivityModeCategory[]>;
  public playerFilter: BehaviorSubject<{
    player: -1 | 0 | 1;
    teammates: -1 | 0 | 1;
    opponents: -1 | 0 | 1;
  }>;

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
                category: 0,
                name: this.manifestService.defs.ActivityMode.get(0)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(0)
                    .displayProperties.icon
                }`
              },
              {
                category: 1,
                name: this.manifestService.defs.ActivityMode.get(7)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(7)
                    .displayProperties.icon
                }`
              },
              {
                category: 2,
                name: this.manifestService.defs.ActivityMode.get(5)
                  .displayProperties.name,
                icon: `https://bungie.net${
                  this.manifestService.defs.ActivityMode.get(5)
                    .displayProperties.icon
                }`
              },
              {
                category: 3,
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
    this.subs = [];
    this.page = new BehaviorSubject(0);
    this.instances = new BehaviorSubject([]);
    this.modeFilter = new BehaviorSubject([0, 1, 2, 3]);
    this.playerFilter = new BehaviorSubject({
      player: 1,
      teammates: 1,
      opponents: 1
    });
    this.filteredInstances = combineLatest(
      this.instances,
      this.modeFilter,
      this.playerFilter,
      this.manifestService.state$
    ).pipe(
      map(([instances, modeFilter, playerFilter, state]) => {
        if (state.loaded) {
          const filtered = [];
          const modeSet = new Set(modeFilter);
          instances.forEach(rawInstance => {
            const instance = { ...rawInstance };
            let modeCategory = 0;
            try {
              const modeType = this.manifestService.defs.Activity.get(
                instance.activityHash
              ).directActivityModeType;
              if (modeType) {
                modeCategory = this.manifestService.defs.ActivityMode.get(
                  modeType
                ).activityModeCategory;
              }
            } catch (e) {}
            if (!instance.team) {
              instance.team = 17;
              instance.videos.forEach(video => {
                if (!video.team) {
                  if (modeCategory === 2) {
                    video.team = 18;
                  } else {
                    video.team = 17;
                  }
                }
              });
            }
            const videoTeamSet = new Set(
              instance.videos.map(video => video.team)
            );
            const player = 16;
            const teammates = instance.team;
            const opponents = teammates === 17 ? 18 : 17;
            instance.videos = instance.videos.filter(video => {
              if (video.team === player) {
                if (playerFilter.player === 1) {
                  return true;
                }
                if (playerFilter.player > -1) {
                  if (modeCategory < 2) {
                    if (
                      videoTeamSet.has(teammates) &&
                      playerFilter.teammates > -1
                    ) {
                      return true;
                    }
                  }
                  if (modeCategory > 1) {
                    if (
                      videoTeamSet.has(opponents) &&
                      playerFilter.opponents > -1
                    ) {
                      return true;
                    }
                  }
                }
              }
              if (video.team === teammates) {
                if (playerFilter.teammates === 1) {
                  return true;
                }
                if (playerFilter.teammates > -1) {
                  if (modeCategory < 2) {
                    if (videoTeamSet.has(player) && playerFilter.player > -1) {
                      return true;
                    }
                  }
                  if (modeCategory > 1) {
                    if (
                      videoTeamSet.has(opponents) &&
                      playerFilter.opponents > -1
                    ) {
                      return true;
                    }
                  }
                }
              }
              if (video.team === opponents) {
                if (playerFilter.opponents === 1) {
                  return true;
                }
                if (playerFilter.opponents === 0) {
                  if (videoTeamSet.has(player) && playerFilter.player > -1) {
                    return true;
                  }
                  if (
                    videoTeamSet.has(teammates) &&
                    playerFilter.teammates > -1
                  ) {
                    return true;
                  }
                }
              }
            });

            if (modeSet.has(modeCategory) && instance.videos.length) {
              filtered.push(instance);
            }
          });
          return filtered;
        } else {
          return instances;
        }
      })
    );
    this.slicedInstances = combineLatest(
      this.filteredInstances,
      this.page
    ).pipe(
      map(([instances, page]) => {
        if (page > Math.floor(instances.length / 7)) {
          page = Math.floor(instances.length / 7);
          this.page.next(page);
        }
        return instances.slice(0 + page * 7, 7 + page * 7);
      })
    );

    this.subs.push(
      this.activatedRoute.params.subscribe((params: Params) => {
        this.settingsService.activeProfiles.next([]);
        this.instances.next([]);

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
                this.instances.next(res.instances);
              })
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

  toggleModeFilter(filter: 0 | 1 | 2 | 3) {
    this.modeFilter.pipe(take(1)).subscribe(currentFilter => {
      const set = new Set(currentFilter);
      if (set.has(filter)) {
        set.delete(filter);
      } else {
        set.add(filter);
      }
      this.modeFilter.next(Array.from(set));
    });
  }

  cyclePlayerFilter(filter: 'player' | 'teammates' | 'opponents') {
    this.playerFilter.pipe(take(1)).subscribe(playerFilter => {
      switch (playerFilter[filter]) {
        case 1:
          playerFilter[filter] = 0;
          break;
        case 0:
          playerFilter[filter] = -1;
          break;
        case -1:
          playerFilter[filter] = 1;
          break;
      }
      this.playerFilter.next(playerFilter);
    });
  }

  nextPage(toTop?: boolean) {
    combineLatest(this.filteredInstances, this.page)
      .pipe(take(1))
      .subscribe(([instances, page]) => {
        if (page < instances.length / 7 - 1) {
          this.page.next(page + 1);
          if (toTop) {
            window.scroll(0, 0);
          }
        }
      });
  }

  prevPage(toTop?: boolean) {
    this.page.pipe(take(1)).subscribe(page => {
      if (page > 0) {
        this.page.next(page - 1);
        if (toTop) {
          window.scroll(0, 0);
        }
      }
    });
  }
}
