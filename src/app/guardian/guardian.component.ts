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
    private router: Router,
    private route: ActivatedRoute,
    private guardianService: GuardianService
  ) { }

  ngOnInit() {
    this._params = this.route.params
      .subscribe((params: Params) => {
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
    this._results = this.guardianService.searchResults
      .subscribe(res => {

        if (res.Response) {
          this.searchResults = res.Response;

          if (res.Response.length === 1) {
            try {
              this.displayName = res.Response[0].displayName;
            } catch (e) {
              this.displayName = '';
            }
          } else {
            this.displayName = '';
          }
        } else {
          this.searchResults = {};
        }
      });
    this._characters = this.guardianService.characters
      .subscribe(
        characters => {
          this.characters = characters;
        }
      );
    this._activeCharacter = this.guardianService.activeCharacter
      .subscribe(character => {
        this.activeCharacter = character;
        try {
          this._platform = character.characterBase.membershipType;
        } catch (e) {}
      });
  }

  ngOnDestroy() {
    this._params.unsubscribe();
    this._results.unsubscribe();
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
