import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';
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
  private subLimiter: Subscription;

  private _guardian: string;

  public membershipType: number;
  public displayName: string;
  public needToSelectPlatform: boolean;
  public characters: bungie.Character[];
  public activeCharacter: bungie.Character;
  public activities: gt.Activity[];
  public gamemode: string;
  public page: number;
  public clipLimiter: gt.ClipLimiter;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private guardianService: GuardianService,
    private settingsService: SettingsService 
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
        this.membershipType = type;
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

    this.subLimiter = this.settingsService.clipLimiter
      .subscribe(limiter => {
        this.clipLimiter = limiter;
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
    this.subLimiter.unsubscribe();
  }

  selectPlatform(platform: string) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(characterId: string) {
    this.router.navigate(['/guardian', this._guardian, this.membershipType, characterId, this.gamemode, 0]);
  }

  selectGamemode(gamemode: string) {
    this.router.navigate(['/guardian', this._guardian, this.membershipType, this.activeCharacter.characterBase.characterId, gamemode, 0]);
  }

  nextPage() {
    this.router.navigate([
      '/guardian', this._guardian, this.membershipType, this.activeCharacter.characterBase.characterId, this.gamemode, this.page + 1
    ]);
  }

  prevPage() {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian', this._guardian, this.membershipType, this.activeCharacter.characterBase.characterId, this.gamemode, this.page - 1
      ]);
    }
  }

  toggleLimiter(limit: string) {
    this.settingsService.toggleLimit = limit;
  }
}
