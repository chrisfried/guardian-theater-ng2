import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardianService } from './guardian.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.component.html',
  styleUrls: ['./guardian.component.scss'],
  providers: [
    GuardianService
  ]
})
export class GuardianComponent implements OnInit, OnDestroy {
  private _guardian: string;
  private _platform: number;
  private _characterId: string;
  private _params: Subscription;
  private _searchResults: Subscription;
  private _accountResults: Subscription;
  public searchResults: bungie.SearchDestinyPlayerResponse;
  public displayName: string;
  public characters: bungie.Character[];
  public activeCharacter: bungie.Character;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private guardianService: GuardianService
  ) { }

  ngOnInit() {
    this._params = this.route.params
      .subscribe((params: Params) => {
        this.activeCharacter = null;
        if (params['guardian']) {
          this._guardian = params['guardian'];
        }
        if (params['character']) {
          this._characterId = params['character'];
        }
        if (params['platform']) {
          this._platform = params['platform'];
        }
      });

    this._searchResults = this.guardianService.searchResults
      .subscribe(res => {

        if (res.Response) {
          this.searchResults = res;

          if (res.Response.length === 1) {
            try {
              this.displayName = res.Response[0].displayName;
              this._platform = res.Response[0].membershipType;
            } catch (e) {
              this.displayName = '';
            }
          } else {
            this.displayName = '';
          }
        } else {
          this.searchResults = { Response: []};
        }
      });

    this._accountResults = this.guardianService.accountResults
      .subscribe(res => {
        this.characters = res.Response.data.characters;
        if (this._characterId) {
          let characterId = this._characterId;
          this.activeCharacter = this.characters.find(function (character) {
            return character.characterBase.characterId === characterId;
          });
        } else {
          this.activeCharacter = this.characters[0];
        }
      });
  }

  ngOnDestroy() {
    this._params.unsubscribe();
    this._searchResults.unsubscribe();
    this._accountResults.unsubscribe();
  }

  selectPlatform(platform) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(character) {
    this.router.navigate(['/guardian', this._guardian, this._platform, character]);
  }
}
