import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { DestinyRaceDefinition } from '../defs/DestinyRaceDefinition';
import { DestinyClassDefinition } from '../defs/DestinyClassDefinition';
import { DestinyActivityDefinition } from '../defs/DestinyActivityDefinition';
import { DestinyActivityModeDefinition } from '../defs/DestinyActivityModeDefinition';

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
          return DestinyRaceDefinition[this.settingsService.userLang.language][hash].raceName;
        case 'class':
          return DestinyClassDefinition[this.settingsService.userLang.language][hash].className;
        case 'activityName':
          return DestinyActivityDefinition[this.settingsService.userLang.language][hash].activityName;
        case 'activityMode':
          return DestinyActivityModeDefinition[this.settingsService.userLang.language][hash].modeName;
        default:
          return '';
      }
    } catch (e) {
      return 'UNDEFINED'
    }
  }

}
