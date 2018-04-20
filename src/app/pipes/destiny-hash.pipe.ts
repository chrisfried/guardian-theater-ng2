import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { DestinyRaceDefinition } from '../defs/DestinyRaceDefinition';
import { DestinyClassDefinition } from '../defs/DestinyClassDefinition';
import { DestinyActivityDefinition } from '../defs/DestinyActivityDefinition';
import { DestinyActivityModeDefinition } from '../defs/DestinyActivityModeDefinition';
import { EmblemDefinition } from '../defs/EmblemDefinition';

@Pipe({
  name: 'destinyHash'
})
export class DestinyHashPipe implements PipeTransform {

  constructor (
    private settingsService: SettingsService
  ) {}

  transform(hash: number, type: string): string {
    try {
      switch (type) {
        case 'race':
          return DestinyRaceDefinition[this.settingsService.userLang.language][hash].name;
        case 'class':
          return DestinyClassDefinition[this.settingsService.userLang.language][hash].name;
        case 'activityName':
          return DestinyActivityDefinition[this.settingsService.userLang.language][hash].name;
        case 'activityMode':
          return DestinyActivityModeDefinition[this.settingsService.userLang.language][hash].name;
        case 'emblemOverlay':
          return EmblemDefinition[hash].secondaryOverlay;
        case 'emblemSpecial':
          return EmblemDefinition[hash].secondarySpecial;
        case 'emblemIcon':
          return EmblemDefinition[hash].icon;
        case 'emblemSecondaryIcon':
          return EmblemDefinition[hash].secondaryIcon;
        default:
          return '';
      }
    } catch (e) {
      return 'UNDEFINED'
    }
  }

}
