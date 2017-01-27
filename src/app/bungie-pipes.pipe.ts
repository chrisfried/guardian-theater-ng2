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