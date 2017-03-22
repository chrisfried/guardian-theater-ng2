import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gtBadge'
})
export class GtBadgePipe implements PipeTransform {

  transform(membershipId: string): string {
    let devs = [
      '375129',
      '5116514'
    ];
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
