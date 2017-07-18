import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twitchStamp'
})
export class TwitchStampPipe implements PipeTransform {

  transform(clipStart: number, entryStart: number): string {
    console.log(clipStart, entryStart);
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
