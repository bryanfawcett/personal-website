//! Dates, without a date library.
//!
//! The Astro views format with `Intl.DateTimeFormat('en-GB' | 'zh-Hans-CN', {year, month:
//! 'long', day, timeZone: 'UTC'})`, which gives `17 November 2026` and `2026年11月17日`.
//! Sanity datetimes are ISO 8601; an offset is applied so the date is the UTC one, as the
//! TypeScript's `timeZone: 'UTC'` does. Anything unparseable returns `None` and the caller
//! leaves the date out: the TypeScript throws a `RangeError` there, which on an on-demand
//! route is a 500 for the whole document.

use components::site::Lang;

const MONTHS: [&str; 12] = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
    "November", "December",
];

/// Days since 1970-01-01 for a civil date (Howard Hinnant's `days_from_civil`).
fn days_from_civil(y: i64, m: i64, d: i64) -> i64 {
    let y = if m <= 2 { y - 1 } else { y };
    let era = y.div_euclid(400);
    let yoe = y - era * 400;
    let mp = (m + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}

/// The inverse: (year, month, day) for days since the epoch.
fn civil_from_days(z: i64) -> (i64, i64, i64) {
    let z = z + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    (if m <= 2 { y + 1 } else { y }, m, d)
}

fn num(s: &str) -> Option<i64> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    s.parse().ok()
}

/// Parse `YYYY-MM-DD`, optionally followed by `T hh:mm[:ss[.fff]]` and `Z` / `±hh:mm`,
/// to the UTC calendar date.
pub fn utc_date(iso: &str) -> Option<(i64, i64, i64)> {
    let iso = iso.trim();
    let (date, time) = match iso.split_once(['T', ' ']) {
        Some((d, t)) => (d, Some(t)),
        None => (iso, None),
    };
    let mut parts = date.split('-');
    let (y, m, d) = (num(parts.next()?)?, num(parts.next()?)?, num(parts.next()?)?);
    if parts.next().is_some() || !(1..=12).contains(&m) || !(1..=31).contains(&d) || !(0..=9999).contains(&y) {
        return None;
    }
    // A day that does not exist (31 February) would roll over silently; refuse it.
    if civil_from_days(days_from_civil(y, m, d)) != (y, m, d) {
        return None;
    }
    let mut minutes = 0i64;
    if let Some(t) = time {
        let (clock, offset) = match t.find(['Z', 'z', '+', '-']) {
            Some(at) => (&t[..at], &t[at..]),
            None => (t, ""),
        };
        let mut c = clock.split(':');
        let hh = num(c.next()?)?;
        let mm = num(c.next().unwrap_or("0"))?;
        if hh > 24 || mm > 59 {
            return None;
        }
        minutes = hh * 60 + mm;
        if let Some(sign) = offset.chars().next().filter(|c| *c == '+' || *c == '-') {
            let body = offset[1..].replace(':', "");
            // ASCII digits only. The length below is in bytes, and slicing a string with a
            // multi-byte character in it at a byte index panics: untrusted input must not.
            if !body.bytes().all(|b| b.is_ascii_digit()) || (body.len() != 4 && body.len() != 2) {
                return None;
            }
            let oh = num(&body[..2])?;
            let om = if body.len() == 4 { num(&body[2..])? } else { 0 };
            let off = oh * 60 + om;
            minutes += if sign == '+' { -off } else { off };
        }
    }
    let days = days_from_civil(y, m, d) + minutes.div_euclid(1440);
    Some(civil_from_days(days))
}

/// `17 November 2026` / `2026年11月17日`.
pub fn format_date(iso: &str, lang: Lang) -> Option<String> {
    let (y, m, d) = utc_date(iso)?;
    Some(match lang {
        Lang::En => format!("{d} {} {y}", MONTHS[(m - 1) as usize]),
        Lang::Zh => format!("{y}年{m}月{d}日"),
    })
}

/// The calendar year of a Unix time in milliseconds (for the footer's copyright line).
pub fn year_of(epoch_ms: u64) -> i64 {
    civil_from_days((epoch_ms / 86_400_000) as i64).0
}

#[cfg(test)]
mod tests {
    #[test]
    fn a_multibyte_offset_is_refused_not_a_panic() {
        // Four bytes, so the old length check passed and slicing at byte 2 split a character.
        for t in ["2026-11-17T10:00:00+a\u{20ac}", "2026-11-17T10:00:00-\u{20ac}a", "2026-11-17T10:00:00+\u{e9}\u{e9}", "2026-11-17T10:00:00+1\u{e9}1"] {
            assert_eq!(utc_date(t), None, "{t:?} must be refused, not panic");
        }
    }

    use super::*;

    #[test]
    fn matches_the_intl_output() {
        assert_eq!(format_date("2026-11-17T08:30:00.000Z", Lang::En).as_deref(), Some("17 November 2026"));
        assert_eq!(format_date("2026-11-17T08:30:00Z", Lang::Zh).as_deref(), Some("2026年11月17日"));
        assert_eq!(format_date("2024-02-29", Lang::En).as_deref(), Some("29 February 2024"));
    }

    #[test]
    fn offsets_move_the_date_to_utc() {
        // 01:00 on the 18th in Singapore is still the 17th in UTC.
        assert_eq!(format_date("2026-11-18T01:00:00+08:00", Lang::En).as_deref(), Some("17 November 2026"));
        assert_eq!(format_date("2026-11-17T23:30:00-02:00", Lang::En).as_deref(), Some("18 November 2026"));
        assert_eq!(format_date("2026-01-01T00:30:00+01:00", Lang::En).as_deref(), Some("31 December 2025"));
    }

    #[test]
    fn nonsense_is_none_not_a_panic() {
        for bad in ["", "garbage", "2026-13-01", "2026-02-31", "2026-11", "2026-11-17T99:00:00Z", "2026-11-17T08:30:00+9"] {
            assert_eq!(format_date(bad, Lang::En), None, "{bad:?}");
        }
    }

    #[test]
    fn year_from_epoch() {
        assert_eq!(year_of(0), 1970);
        assert_eq!(year_of(1_767_225_600_000), 2026); // 2026-01-01
        assert_eq!(year_of(1_767_225_599_999), 2025);
    }
}
