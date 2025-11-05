/*
  Time utilities shared across the page.
  These normalize Timefold timestamps and durations into JS-friendly formats.
*/

/*
  Convert a Timefold timestamp (string or Date) into a plain Date object.
  Timefold returns ISO with timezone — this ensures consistent parsing in the browser.
*/
export function wallDate(iso: any): Date {
    if (!iso) return new Date(NaN);
    if (iso instanceof Date) return iso;
    const s = String(iso);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!m) return new Date(s);
    const [, Y, M, D, h, mnt, sec] = m.map(Number);
    return new Date(Y, M - 1, D, h, mnt, sec);
}

/*
  Parse ISO-8601 duration (e.g. "PT1H30M") into seconds.
  Used for computing travel-time KPI.
*/
export function parseDurationToSeconds(iso: string): number {
    const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    const [, h, mnt, s] = m.map(Number);
    return (h || 0) * 3600 + (mnt || 0) * 60 + (s || 0);
}

/*
  Hash events by count + first/last timestamp.
  Used to avoid unnecessary React state updates when polling results.
*/
export function hashEvents(evts: any[]) {
    const len = evts.length
    const first = len ? evts[0].startDate?.getTime() || 0 : 0
    const last = len ? evts[len - 1].endDate?.getTime() || 0 : 0
    return `${len}|${first}|${last}`
}