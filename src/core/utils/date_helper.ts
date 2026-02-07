// src/common/helpers/date.helper.ts
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

export class DateHelper {

  static localToUTC(
    localDate: Date | string = new Date(),
    timeZone: string = 'UTC'
  ): Date {
    return fromZonedTime(localDate, timeZone);
  }


  static utcToLocalDate(
    utcDate: Date | string,
    timeZone: string
  ): Date {
    return toZonedTime(new Date(utcDate), timeZone);
  }

  static utcToLocalString(
    utcDate: Date | string,
    timeZone: string,
    formatStr = 'yyyy-MM-dd HH:mm:ss'
  ): string {
    const localDate = toZonedTime(new Date(utcDate), timeZone);
    return format(localDate, formatStr, { timeZone });
  }
}
