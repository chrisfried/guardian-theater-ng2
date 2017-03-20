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

@Pipe({
  name: 'twitchStamp'
})
export class TwitchStampPipe implements PipeTransform {
  transform(clipStart: number, entryStart: number): string {
    let offset = entryStart - clipStart;
    let hms = '0:00:00';
    if (offset > 0) {
      hms = Math.floor(offset / 3600) + ':'
            + (Math.floor(offset % 3600 / 60) < 10 ? '0' : '')
            + Math.floor(offset % 3600 / 60) + ':'
            + (Math.floor(offset % 3600 % 60) < 10 ? '0' : '')
            + Math.floor(offset % 3600 % 60);
    }
    return hms;
  }
}

@Pipe({
  name: 'gtBadge'
})
export class GtBadgePipe implements PipeTransform {
  transform(membershipId: string): string {
    let devs = [
      '375129',
      '5116514'
    ]
    let patrons = [
      '9303125', // v DontCare v
      '10213132', // designker
      '11828236'  // cowgod77
    ];
    if (devs.indexOf(membershipId) > -1) {
      return 'Dev';
    }
    if (patrons.indexOf(membershipId) > -1) {
      return 'Patron';
    }
    return '';
  }
}