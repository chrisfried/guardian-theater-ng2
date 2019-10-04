import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ServerResponse, UserInfoCard } from 'bungie-api-ts/user';
import { BehaviorSubject, Subscription, empty as observableEmpty } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { BungieHttpService } from '../services/bungie-http.service';
import { GuardianService } from '../services/guardian.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [GuardianService]
})
export class SearchComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public searchResults: UserInfoCard[];
  public checkingDuplicates: boolean;

  public searchName: BehaviorSubject<string>;
  private searchResponse: Subscription;
  private params$: Subscription;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private guardianService: GuardianService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.searchName = new BehaviorSubject('');
    this.searching = true;
    this.checkingDuplicates = true;

    this.params$ = this.activatedRoute.params.subscribe((params: Params) => {
      this.searchResults = null;
      if (params['guardian']) {
        localStorage.setItem('gt.LAST_SEARCH', params['guardian']);
        this.searchName.next(params['guardian']);
      }
    });

    this.searchResponse = this.searchName
      .pipe(
        map(searchName => {
          this.searching = true;
          return searchName.length
            ? 'https://stats.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' +
                encodeURIComponent(searchName) +
                '/'
            : '';
        }),
        distinctUntilChanged(),
        switchMap((url: string) => {
          if (url.length) {
            return this.bHttp.get(url);
          } else {
            return observableEmpty();
          }
        })
      )
      .subscribe((res: ServerResponse<UserInfoCard[]>) => {
        this.searchResults = res.Response;
        const result = this.searchResults[0];
        if (this.searchResults.length === 1) {
          this.router.navigate(
            [
              '/guardian',
              result.membershipType,
              result.membershipId,
              'None',
              0
            ],
            {
              replaceUrl: true
            }
          );
        }
        if (this.searchResults.length > 1) {
          this.guardianService
            .getLinkedAccounts(result.membershipType, result.membershipId)
            .subscribe(linkedAccounts => {
              const matches = [];
              this.searchResults.forEach(searchResult => {
                linkedAccounts.Response.profiles.some(profile => {
                  if (
                    searchResult.membershipType === profile.membershipType &&
                    searchResult.membershipId === profile.membershipId
                  ) {
                    matches.push(profile);
                    return true;
                  }
                });
                linkedAccounts.Response.profilesWithErrors.some(profile => {
                  if (
                    searchResult.membershipType ===
                      profile.infoCard.membershipType &&
                    searchResult.membershipId === profile.infoCard.membershipId
                  ) {
                    matches.push(profile);
                    return true;
                  }
                });
              });
              if (matches.length === this.searchResults.length) {
                this.router.navigate(
                  [
                    '/guardian',
                    result.membershipType,
                    result.membershipId,
                    'None',
                    0
                  ],
                  {
                    replaceUrl: true
                  }
                );
              }
              this.checkingDuplicates = false;
            });
        } else {
          this.checkingDuplicates = false;
        }
        this.searching = false;
      });
  }

  ngOnDestroy() {
    this.params$.unsubscribe();
    this.searchResponse.unsubscribe();
  }

  route(route: any[]) {
    this.router.navigate(route);
  }
}
