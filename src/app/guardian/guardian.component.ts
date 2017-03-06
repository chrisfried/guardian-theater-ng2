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
  private subDisplayName: Subscription;
  private subSelectPlatform: Subscription;
  private subMembershipType: Subscription;
  private subSearch: Subscription;
  private subCharacters: Subscription;
  private subActiveCharacter: Subscription;

  private _guardian: string;
  private _platform: number;

  public displayName: string;
  public needToSelectPlatform: boolean;
  public characters: bungie.Character[];
  public activeCharacter: bungie.Character;

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
  }

  ngOnDestroy() {
    this.subDisplayName.unsubscribe();
    this.subSelectPlatform.unsubscribe();
    this.subMembershipType.unsubscribe();
    this.subSearch.unsubscribe();
    this.subCharacters.unsubscribe();
    this.subActiveCharacter.unsubscribe();
  }

  selectPlatform(platform) {
    this.router.navigate(['/guardian', this._guardian, platform]);
  }

  selectCharacter(characterId) {
    this.router.navigate(['/guardian', this._guardian, this._platform, characterId]);
  }
}
