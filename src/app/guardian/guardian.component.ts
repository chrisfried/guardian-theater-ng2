import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

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
  public membershipId: string;
  public displayName: string;
  public displayTag: string;
  public searchResults: bungie.SearchDestinyPlayerResult[];
  public characters: bungie.Character[];
  public activeCharacter: bungie.Character;
  public activities: gt.Activity[];
  public gamemode: string;
  public page: number;
  public clipLimiter: gt.ClipLimiter;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public guardianService: GuardianService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {

    // TO DO: If membershipType !== 1, 2, or 4, redirect to search.

    this.subs = [];

    this.subs.push(this.activatedRoute.params
      .subscribe((params: Params) => {
        if (!(params['membershipType'] === '1' || params['membershipType'] === '2' || params['membershipType'] === '4')) {
          this.router.navigate(['/search', params['membershipType']], { replaceUrl: true });
        }
        if (params['membershipType'] && params['membershipId'] && !params['characterId']) {
          this.subs.push(this.guardianService.characters.subscribe(characters => {
            try {
              let charactersArray = [];
              for (let key in characters) {
                if (characters[key]) {
                  charactersArray.push(characters[key]);
                }
              }
              if (charactersArray[0].characterId) {
                this.router.navigate(['/guardian', params['membershipType'], params['membershipId'],
                  charactersArray[0].characterId, 'None', 0], { replaceUrl: true });
              }
            } catch (e) { }
          }));
        }

        if (params['membershipType']) {
          this.guardianService.membershipType.next(+params['membershipType']);
        } else {
          this.guardianService.membershipType.next(-1);
        }

        if (params['membershipId']) {
          this.guardianService.membershipId.next(params['membershipId']);
        } else {
          this.guardianService.membershipId.next('');
        }

        if (params['characterId']) {
          this.guardianService.characterId.next(params['characterId']);
        } else {
          this.guardianService.characterId.next('');
        }

        if (params['gamemode']) {
          this.guardianService.activityMode.next(params['gamemode']);
        } else {
          this.guardianService.activityMode.next('None');
        }

        if (params['page']) {
          this.guardianService.activityPage.next(+params['page']);
        } else {
          this.guardianService.activityPage.next(0);
        }
      }));

    this.subs.push(this.guardianService.displayName
      .subscribe(name => {
        this.displayName = name.split('#')[0];
        if (name.split('#')[1]) {
          this.displayTag = ' #' + name.split('#')[1];
        }
      }));

    this.subs.push(this.guardianService.membershipType
      .subscribe(type => {
        this.membershipType = type;
      }));

    this.subs.push(this.guardianService.membershipId
      .subscribe(type => {
        this.membershipId = type;
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
        console.log(character);
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

  selectCharacter(characterId: string) {
    this.router.navigate(['/guardian', this.membershipType, this.membershipId, characterId, this.gamemode, 0]);
  }

  selectGamemode(gamemode: string) {
    this.router.navigate(['/guardian', this.membershipType, this.membershipId, this.activeCharacter.characterId, gamemode, 0]);
  }

  nextPage() {
    this.router.navigate([
      '/guardian', this.membershipType, this.membershipId, this.activeCharacter.characterId, this.gamemode, this.page + 1
    ]);
  }

  prevPage() {
    if (this.page > 0) {
      this.router.navigate([
        '/guardian', this.membershipType, this.membershipId, this.activeCharacter.characterId, this.gamemode, this.page - 1
      ]);
    }
  }

  toggleLimiter(limit: string) {
    this.settingsService.toggleLimit = limit;
  }
}
