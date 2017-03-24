import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gtBadge'
})
export class GtBadgePipe implements PipeTransform {

  transform(membershipId: string): string {
    let owner = [
      '375129' // chrisfried
    ]
    let contributors = [
      '5116514' // RealAngryMonkey
    ];
    let donors = [
      '8278779', // QuiscalusMajor
    ]
    let patrons = [
      '9303125', // v DontCare v
      '10213132', // designker
      '11828236'  // cowgod77
    ];
    if (owner.indexOf(membershipId) > -1) {
      return 'Owner';
    } else if (contributors.indexOf(membershipId) > -1) {
      return 'Contributor';
    } else if (donors.indexOf(membershipId) > -1) {
      return 'Donor';
    } else if (patrons.indexOf(membershipId) > -1) {
      return 'Patron';
    } else {
      return '';
    }
  }

}
