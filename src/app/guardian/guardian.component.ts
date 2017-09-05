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
  private subs: Subscription[];

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
    public guardianService: GuardianService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {

    this.subs = [];

    this.subs.push(this.guardianService.displayName
      .subscribe(name => {
        this.displayName = name;
      }));

    this.subs.push(this.guardianService.selectPlatform
      .subscribe(bool => {
        this.needToSelectPlatform = bool;
      }));

    this.subs.push(this.guardianService.membershipType
      .subscribe(type => {
        this.membershipType = type;
      }));

    this.subs.push(this.guardianService.searchName
      .subscribe(name => {
        this._guardian = name;
      }));

    this.subs.push(this.guardianService.characters
      .subscribe(characters => {
        if (characters) {
          let charactersArray = [];
          for (let key in characters) {
            if (characters[key]) {
              charactersArray.push(characters[key]);
            }
          }
          this.characters = charactersArray;
        } else {
          this.characters = [];
        }
      }));

    this.subs.push(this.guardianService.activeCharacter
      .subscribe(character => {
        this.activeCharacter = character;
      }));

    this.subs.push(this.guardianService.activities
      .subscribe(activities => {
        this.activities = activities;
      }));

    this.subs.push(this.guardianService.activityMode
      .subscribe(gamemode => {
        this.gamemode = gamemode;
      }));

    this.subs.push(this.guardianService.activityPage
      .subscribe(page => {
        this.page = page;
      }));

    this.subs.push(this.settingsService.clipLimiter
      .subscribe(limiter => {
        this.clipLimiter = limiter;
      }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  selectPlatform(platform: string) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(characterId: string) {
    this.router.navigate(['/guardian', this._guardian, this.membershipType, characterId, this.gamemode, 0]);
  }

  selectGamemode(gamemode: string) {
    this.router.navigate(['/guardian', this._guardian, this.membershipType, this.activeCharacter.characterId, gamemode, 0]);
  }

  nextPage() {
    this.router.navigate([
      '/guardian', this._guardian, this.membershipType, this.activeCharacter.characterId, this.gamemode, this.page + 1
    ]);
  }

  prevPage() {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian', this._guardian, this.membershipType, this.activeCharacter.characterId, this.gamemode, this.page - 1
      ]);
    }
  }

  toggleLimiter(limit: string) {
    this.settingsService.toggleLimit = limit;
  }
}
