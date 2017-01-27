import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../services/search.service';
import { GuardianService } from '../services/guardian.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.component.html',
  styleUrls: ['./guardian.component.scss']
})
export class GuardianComponent implements OnInit, OnDestroy {
  private _guardian: string;
  private _platform: number;
  private _activeCharacterId: string;
  private _params: Subscription;
  private _results: Subscription;
  private _characters: Subscription;
  private _characterId: Subscription;
  private _activeCharacter: Subscription;
  public searchResults: {};
  public displayName: string;
  public characters: {}[];
  public activeCharacter: {};

  constructor(
    private searchService: SearchService,
    private guardianService: GuardianService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.searchService.setSearchString = '';
    this._params = this.route.params
      .subscribe((params: Params) => {
        this.searchService.setSearchString = this._guardian = params['guardian'];
        if (params['platform']) {
          this.searchService.setPlatform = this._platform = params['platform'];
        } else {
          this.searchService.setPlatform = '-1';
        }
        if (params['character']) {
          this.guardianService.setCharacterId = params['character'];
        } else {
          this.guardianService.setCharacterId = '';
        }
      });
    this._results = this.searchService.searchResults.subscribe(res => {
      if (res.Response) {
        this.searchResults = res.Response;
        if (res.Response.length === 1) {
          let result = res.Response[0];
          try {
            this.guardianService.setDisplayName = this.displayName = result.displayName;
            this.guardianService.setMembershipType = this._platform = result.membershipType;
            this.guardianService.setMembershipId = result.membershipId;
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
    this._characterId = this.guardianService.characterId.subscribe(
      characterId => this._activeCharacterId = characterId
    );
    this._characters = this.guardianService.characters.subscribe(
      characters => {
        this.characters = characters;
        if (!this._activeCharacterId) {
          try {
            this.guardianService.setCharacterId = characters[0].characterBase.characterId;
          } catch (e) {
            console.log(e);
          }
        }
      }
    );
    this._activeCharacter = this.guardianService.activeCharacter.subscribe(
      character => this.activeCharacter = character
    );
  }

  ngOnDestroy() {
    this._params.unsubscribe();
    this._results.unsubscribe();
    this._characterId.unsubscribe();
    this._characters.unsubscribe();
    this._activeCharacter.unsubscribe();
  }

  selectPlatform(platform) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(character) {
    this.router.navigate(['/guardian', this._guardian, this._platform, character]);
  }
}
