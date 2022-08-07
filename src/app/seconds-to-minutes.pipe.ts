import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToMinutes'
})
export class SecondsToMinutesPipe implements PipeTransform {

  transform(value: number | null, ...args: unknown[]): unknown {
    if (value === null) return null;
    let mins = Math.floor(value / 60);
    let secs = value - mins*60;
    return `${mins > 9 ? mins : '0'+mins}:${secs > 9 ? secs : '0'+secs}`;
  }

}
