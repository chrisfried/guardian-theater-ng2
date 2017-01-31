import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'classType'
})
export class ClassTypePipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0: return 'Titan';
      case 1: return 'Hunter';
      case 2: return 'Warlock';

      default: return '';
    }
  }
}

@Pipe({
  name: 'raceHash'
})
export class RaceHashPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 2803282938: return 'Awoken';
      case 3887404748: return 'Human';
      case 898834093: return 'Exo';

      default: return '';
    }
  }
}


@Pipe({
  name: 'activityMode'
})
export class ActivityModePipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0: return 'None';
      case 2: return 'Story';
      case 3: return 'Strike';
      case 4: return 'Raid';
      case 5: return 'PvP';
      case 6: return 'Patrol';
      case 7: return 'PvE';
      case 8: return 'PvP Introduction';
      case 9: return 'Skirmish';
      case 10: return 'Control';
      case 11: return 'Salvage';
      case 12: return 'Clash';
      case 13: return 'Rumble';
      case 14: return 'Trials of Osiris';
      case 15: return 'Doubles';
      case 16: return 'Nightfall';
      case 17: return 'Nightfall';
      case 18: return 'Strike';
      case 19: return 'Iron Banner';
      case 20: return 'Prison of Elders';
      case 21: return 'Prison of Elders';
      case 22: return 'Challenge of the Elders';
      case 23: return 'Elimination';
      case 24: return 'Rift';
      case 25: return 'Mayhem';
      case 26: return 'Mayhem Clash';
      case 27: return 'Mayhem Rumble';
      case 28: return 'Zone Control';
      case 29: return 'Sparrow Racing';
      case 30: return 'Challenge of the Elders';
      case 31: return 'Supremacy';
      case 32: return 'Private Match';
      case 33: return 'Supremacy Rumble';
      case 34: return 'Supremacy Clash';
      case 35: return 'Supremacy Inferno';
      case 36: return 'Supremacy Mayhem';

      default: return 'Undefined';
    }
  }
}
