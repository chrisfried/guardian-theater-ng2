import {
  throwError as observableThrowError,
  empty as observableEmpty,
  Observable,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BungieHttpService } from '../services/bungie-http.service';
import {
  map,
  catchError,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';
import { UserInfoCard, ServerResponse } from 'bungie-api-ts/user';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  public searching: boolean;
  public searchResults: UserInfoCard[];

  private searchName: BehaviorSubject<string>;
  private searchResponse: Subscription;
  private params$: Subscription;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.searchName = new BehaviorSubject('');
    this.searching = true;

    this.params$ = this.activatedRoute.params.subscribe((params: Params) => {
      this.searchResults = null;
      if (params['guardian']) {
        this.searchName.next(params['guardian']);
      }
    });

    this.searchResponse = this.searchName
      .pipe(
        map(searchName => {
          this.searching = true;
          return searchName.length
            ? 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/' +
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
        }),
        catchError((error: any) =>
          observableThrowError(error.json().error || 'Server error')
        )
      )
      .subscribe((res: ServerResponse<UserInfoCard[]>) => {
        this.searchResults = res.Response;
        if (this.searchResults.length === 1) {
          const result = this.searchResults[0];
          this.router.navigate([
            '/guardian',
            result.membershipType,
            result.membershipId
          ]);
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
