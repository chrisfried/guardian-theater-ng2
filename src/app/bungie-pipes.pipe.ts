import { Pipe, PipeTransform } from '@angular/core';
import { DestinyActivityDefinition } from './defs/DestinyActivityDefinition';
import { DestinyActivityModeDefinition } from './defs/DestinyActivityModeDefinition';
import { DestinyClassDefinition } from './defs/DestinyClassDefinition';
import { DestinyRaceDefinition } from './defs/DestinyRaceDefinition';
import { SettingsService } from './services/settings.service';

@Pipe({
  name: 'classHash'
})
export class ClassHashPipe implements PipeTransform {
  constructor (
    private settingsService: SettingsService
  ) {}

  transform(classHash: number): string {
    return DestinyClassDefinition[this.settingsService.userLang][classHash].className;
  }
}

@Pipe({
  name: 'raceHash'
})
export class RaceHashPipe implements PipeTransform {
  constructor (
    private settingsService: SettingsService
  ) {}

  transform(raceHash: number): string {
    return DestinyRaceDefinition[this.settingsService.userLang][raceHash].raceName;
  }
}

@Pipe({
  name: 'activityName'
})
export class ActivityNamePipe implements PipeTransform {
  constructor (
    private settingsService: SettingsService
  ) {}

  transform (activityHash: number): string {
    return DestinyActivityDefinition[this.settingsService.userLang][activityHash].activityName;
  }
}

@Pipe({
  name: 'activityMode'
})
export class ActivityModePipe implements PipeTransform {
  constructor (
    private settingsService: SettingsService
  ) {}

  transform(modeType: number): string {
    return DestinyActivityModeDefinition[this.settingsService.userLang][modeType].modeName;
  }
}
