import { fetchJson } from "./api";

type HolidayResponse = {
  year: number;
  country_code: string;
  dates: string[];
};

export async function getPublicHolidayDates(year: number, countryCode = "AR") {
  const response = await fetchJson<HolidayResponse>(
    `/calendar/holidays/${year}/${countryCode.toUpperCase()}`
  );
  return response.dates;
}
