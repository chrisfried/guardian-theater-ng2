import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardianService } from '../services/guardian.service';
import { Router, ActivatedRoute } from '@angular/router';
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
  private subDisplayName: Subscription;
  private subSelectPlatform: Subscription;
  private subMembershipType: Subscription;
  private subSearch: Subscription;
  private subCharacters: Subscription;
  private subActiveCharacter: Subscription;
  private subActivities: Subscription;
  private subGamemode: Subscription;
  private subPage: Subscription;

  private _guardian: string;
  private _platform: number;

  public displayName: string;
  public needToSelectPlatform: boolean;
  public characters: bungie.Character[];
  public activeCharacter: bungie.Character;
  public activities: bungie.Activity[];
  public gamemode: string;
  public page: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private guardianService: GuardianService
  ) { }

  ngOnInit() {

    this.subDisplayName = this.guardianService.displayName
      .subscribe(name => {
        this.displayName = name;
      });

    this.subSelectPlatform = this.guardianService.selectPlatform
      .subscribe(bool => {
        this.needToSelectPlatform = bool;
      });

    this.subMembershipType = this.guardianService.membershipType
      .subscribe(type => {
        this._platform = type;
      });

    this.subSearch = this.guardianService.searchName
      .subscribe(name => {
        this._guardian = name;
      });

    this.subCharacters = this.guardianService.characters
      .subscribe(characters => {
        this.characters = characters;
      });

    this.subActiveCharacter = this.guardianService.activeCharacter
      .subscribe(character => {
        this.activeCharacter = character;
      });

    this.subActivities = this.guardianService.activities
      .subscribe(activities => {
        this.activities = activities;
      });

    this.subGamemode = this.guardianService.activityMode
      .subscribe(gamemode => {
        this.gamemode = gamemode;
      });

    this.subPage = this.guardianService.activityPage
      .subscribe(page => {
        this.page = page;
      });
  }

  ngOnDestroy() {
    this.subDisplayName.unsubscribe();
    this.subSelectPlatform.unsubscribe();
    this.subMembershipType.unsubscribe();
    this.subSearch.unsubscribe();
    this.subCharacters.unsubscribe();
    this.subActiveCharacter.unsubscribe();
    this.subActivities.unsubscribe();
    this.subGamemode.unsubscribe();
    this.subPage.unsubscribe();
  }

  selectPlatform(platform) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(characterId) {
    this.router.navigate(['/guardian', this._guardian, this._platform, characterId, this.gamemode, 0]);
  }

  selectGamemode(gamemode) {
    this.router.navigate(['/guardian', this._guardian, this._platform, this.activeCharacter.characterBase.characterId, gamemode, 0]);
  }

  nextPage() {
    this.router.navigate([
      '/guardian', this._guardian, this._platform, this.activeCharacter.characterBase.characterId, this.gamemode, this.page + 1
    ]);
  }

  prevPage() {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian', this._guardian, this._platform, this.activeCharacter.characterBase.characterId, this.gamemode, this.page - 1
      ]);
    }
  }
}
