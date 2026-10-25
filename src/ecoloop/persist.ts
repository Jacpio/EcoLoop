// Pure helpers for restoring the locally saved demo state. No runtime imports,
// so they can be exercised by `npm test` without React Native.

export const STORAGE_KEY = "ecoloop-demo-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const recordList = (value: unknown) =>
  Array.isArray(value) ? value.filter(isRecord) : null;

/**
 * Restores a saved snapshot on top of `defaults`.
 *
 * Returns `null` when the snapshot is unusable (corrupt JSON shape, missing
 * lists), so the caller keeps the defaults. Individual fields of the wrong type
 * are ignored instead of poisoning the whole state, which means data saved by
 * an older build never crashes the app on start-up.
 */
export function mergeSavedState<S extends object>(
  saved: unknown,
  defaults: S,
): S | null {
  if (!isRecord(saved)) return null;
  const base = defaults as Record<string, unknown>;
  const next: Record<string, unknown> = { ...base };
  for (const key of ["offers", "collections", "electronics", "reports"]) {
    const list = recordList(saved[key]);
    if (!list) return null;
    next[key] = list;
  }
  if (typeof saved.onboarded === "boolean") next.onboarded = saved.onboarded;
  if (typeof saved.notifications === "boolean")
    next.notifications = saved.notifications;
  if (typeof saved.ecoPoints === "number" && Number.isFinite(saved.ecoPoints))
    next.ecoPoints = saved.ecoPoints;
  if (typeof saved.partnerArea === "string")
    next.partnerArea = saved.partnerArea;
  if (typeof saved.partnerHours === "string")
    next.partnerHours = saved.partnerHours;
  if (saved.user === null) next.user = null;
  else if (
    isRecord(saved.user) &&
    typeof saved.user.name === "string" &&
    typeof saved.user.role === "string"
  )
    next.user = { name: saved.user.name, role: saved.user.role };
  if (isRecord(saved.pointStatus))
    next.pointStatus = Object.fromEntries(
      Object.entries(saved.pointStatus).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  if (isRecord(saved.preferences))
    next.preferences = {
      ...(base.preferences as object),
      ...Object.fromEntries(
        Object.entries(saved.preferences).filter(
          ([, value]) => typeof value === "string",
        ),
      ),
    };
  // A saved phone is either empty or exactly nine digits; anything else is junk.
  const prefs = next.preferences as Record<string, unknown> | undefined;
  if (prefs && !/^(\d{9})?$/.test(String(prefs.phone ?? "")))
    prefs.phone = (base.preferences as Record<string, unknown>).phone;
  if (isRecord(saved.draft))
    next.draft = { ...(base.draft as object), ...saved.draft };
  return next as S;
}
