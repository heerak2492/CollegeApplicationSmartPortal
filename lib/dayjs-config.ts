import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getConfiguredDayjs = () => {
  const defaultTimezone = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Kolkata";
  dayjs.tz.setDefault(defaultTimezone);
  return dayjs;
};

export default getConfiguredDayjs();
