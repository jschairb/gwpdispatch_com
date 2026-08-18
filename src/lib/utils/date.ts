import { formatDistanceToNow, parseISO, format } from "date-fns";

const FORMAT_LONG = "EEEE, MMMM d, yyyy h:mm a zz";
const FORMAT_SHORT = "MMMM dd, yyyy zz";
// AP-style press dateline: no weekday, no clock time, no zone.
const FORMAT_PRESS = "MMMM d, yyyy";

const dateCache = new Map<string, Date>();


export const getDateDistance = (date: string) =>
  formatDistanceToNow(parseISO(date), {
    addSuffix: true,
  });


export const normalizeDate = (date: string | Date): string =>
  date instanceof Date ? date.toISOString() : date;

const getParsedDate = (dateString: string): Date => {
  if (dateCache.has(dateString)) {
    return dateCache.get(dateString)!;
  }

  const parsedDate = parseISO(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date value provided.");
  }

  dateCache.set(dateString, parsedDate);
  return parsedDate;
};

const FORMATS = {
  long: FORMAT_LONG,
  short: FORMAT_SHORT,
  press: FORMAT_PRESS,
} as const;

export const formatDate = (
  date: string | Date,
  formatType: keyof typeof FORMATS = "long"
) => {
  // Ensure that the date is a valid Date string
  const dateString = date instanceof Date ? date.toISOString() : date;

  // Get parsed date from cache or parse it
  const parsedDate = getParsedDate(dateString);

  // Format the date based on the requested format
  return format(parsedDate, FORMATS[formatType] ?? FORMAT_LONG);
};