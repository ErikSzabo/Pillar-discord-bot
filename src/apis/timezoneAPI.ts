/**
 * Utility class to convert date objects from UTC to a
 * specific time zone, or to convert dates between time zones.
 */
export class Timezone {
  private static systemOffset = new Date().getTimezoneOffset() * 60000;
  /**
   * Time zone abbreviation
   */
  public readonly abbreviation: string;
  /**
   * Time offset from the UTC time in milliseconds
   */
  public readonly utcOffset: number;
  /**
   * Lambda function which takes the year, month, day, hour, minute, seconds as a parameter
   * and returns a string representation of a date.
   */
  private readonly formatter: Function;

  constructor(
    abbreviation: string,
    utcOffsetInHours: number,
    formatter: Function
  ) {
    this.abbreviation = abbreviation;
    this.utcOffset = utcOffsetInHours * 60 * 60 * 1000;
    this.formatter = formatter;
  }

  /**
   * Converts a date to this time zone from an another.
   *
   * @param date date to convert
   * @param from time zone to convert from
   */
  public convert(date: Date, from: Timezone = Timezones.UTC) {
    return new Date(
      date.getTime() + this.utcOffset - from.utcOffset - Timezone.systemOffset
    );
  }

  /**
   * Returns a string representation of the date in this time zone
   * by using the formatter.
   *
   * @param convertedDate date converted by the time zone
   */
  public toDateString(convertedDate: Date) {
    return this.formatter(
      convertedDate.getFullYear(),
      convertedDate.getMonth(),
      convertedDate.getDate(),
      convertedDate.getHours(),
      convertedDate.getMinutes()
    );
  }
}

/**
 * Collection of predefined time zones.
 */
export class Timezones {
  public static readonly UTC = new Timezone('UTC', 0, ymd24h);
  public static readonly CET = new Timezone('CET', 1, ymd24h);
  public static readonly CEST = new Timezone('CEST', 2, ymd24h);
  public static readonly EET = new Timezone('EET', 2, ymd24h);
  public static readonly MSK = new Timezone('MSK', 3, ymd24h);
  public static readonly PST = new Timezone('PST', -8, mdy12h);
  public static readonly PDT = new Timezone('PDT', -7, mdy12h);
  public static readonly MST = new Timezone('MST', -7, mdy12h);
  public static readonly MDT = new Timezone('MDT', -6, mdy12h);
  public static readonly CST = new Timezone('CST', -6, mdy12h);
  public static readonly CDT = new Timezone('CDT', -5, mdy12h);
  public static readonly EST = new Timezone('EST', -5, mdy12h);
  public static readonly EDT = new Timezone('EDT', -4, mdy12h);
}

/**
 * Date string converter.
 * Converts a date to this format: yyyy/mm/dd -- hh/mm/ss
 */
export function ymd24h(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  return `${year}.${month < 9 ? '0' : ''}${month + 1}.${
    day < 10 ? '0' : ''
  }${day} -- ${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`;
}

/**
 * Date string converter.
 * Converts a date to this format: mm/dd/yyyy -- hh:mm AM/PM
 */
export function mdy12h(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  const ampm = hour <= 12 ? 'AM' : 'PM';
  hour = hour <= 12 ? hour : hour - 12;
  return `${month < 9 ? '0' : ''}${month + 1}/${
    day < 10 ? '0' : ''
  }${day}/${year} -- ${hour < 10 ? '0' : ''}${hour}:${
    minute < 10 ? '0' : ''
  }${minute} ${ampm}`;
}
