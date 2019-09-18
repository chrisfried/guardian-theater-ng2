import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { DestinyRaceDefinition } from '../defs/DestinyRaceDefinition';
import { DestinyClassDefinition } from '../defs/DestinyClassDefinition';
import { DestinyActivityDefinition } from '../defs/DestinyActivityDefinition';
import { DestinyActivityModeDefinition } from '../defs/DestinyActivityModeDefinition';
import { EmblemDefinition } from '../defs/EmblemDefinition';
import { ManifestService } from 'app/services/manifest.service';

@Pipe({
  name: 'destinyHash'
})
export class DestinyHashPipe implements PipeTransform {
  constructor(
    private settingsService: SettingsService,
    private manifestService: ManifestService
  ) {}

  transform(hash: number, type: string): string {
    try {
      switch (type) {
        case 'race':
          return DestinyRaceDefinition[this.settingsService.userLang.language][
            hash
          ].name;
        case 'class':
          return DestinyClassDefinition[this.settingsService.userLang.language][
            hash
          ].name;
        case 'activityName':
          return this.manifestService.defs.Activity.get(hash).displayProperties
            .name;
        case 'activityMode':
          return this.manifestService.defs.Activity.get(hash).displayProperties
            .name;
        case 'activityIcon':
          return this.manifestService.defs.Activity.get(hash).displayProperties
            .hasIcon
            ? `https://bungie.net${
                this.manifestService.defs.Activity.get(hash).displayProperties
                  .icon
              }`
            : ``;
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
      return 'UNDEFINED';
    }
  }
}
