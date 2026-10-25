const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mergeSavedState } = require("../src/ecoloop/persist.ts");

const defaults = {
  onboarded: false,
  user: null,
  offers: [{ id: "EL-1042" }],
  collections: [],
  electronics: [],
  reports: [],
  pointStatus: {},
  draft: { id: "", quantity: 40, share: 50, date: "25.10.2026" },
  notifications: false,
  ecoPoints: 1250,
  preferences: { area: "Warszawa, Centrum", radius: "3 km" },
  partnerArea: "Śródmieście",
  partnerHours: "Pon.–pt. 08:00–16:00",
};
const saved = (patch = {}) => ({
  offers: [],
  collections: [],
  electronics: [],
  reports: [],
  ...patch,
});

test("Nieprawidłowy zapis nie zastępuje stanu domyślnego", () => {
  for (const value of [null, undefined, "x", 7, [], {}, saved({ offers: {} })])
    assert.equal(mergeSavedState(value, defaults), null);
  assert.equal(mergeSavedState(saved({ reports: "oops" }), defaults), null);
});

test("Zapisane listy zastępują domyślne, a elementy niebędące obiektami są odrzucane", () => {
  const result = mergeSavedState(
    saved({ offers: [{ id: "A" }, 5, null, "x"] }),
    defaults,
  );
  assert.deepEqual(result.offers, [{ id: "A" }]);
});

test("Brakujące pola uzupełniane są wartościami domyślnymi", () => {
  const result = mergeSavedState(saved(), defaults);
  assert.equal(result.ecoPoints, 1250);
  assert.equal(result.partnerArea, "Śródmieście");
  assert.deepEqual(result.preferences, defaults.preferences);
  assert.equal(result.draft.quantity, 40);
});

test("Pola ze złym typem są ignorowane, a poprawne zachowane", () => {
  const result = mergeSavedState(
    saved({
      onboarded: "yes",
      notifications: true,
      ecoPoints: "dużo",
      user: { name: "Anna Kowalska" },
      pointStatus: { market: "Awaria", hala: 3 },
      preferences: { area: "Wola", radius: 5 },
    }),
    defaults,
  );
  assert.equal(result.onboarded, false);
  assert.equal(result.notifications, true);
  assert.equal(result.ecoPoints, 1250);
  assert.equal(result.user, null);
  assert.deepEqual(result.pointStatus, { market: "Awaria" });
  assert.deepEqual(result.preferences, { area: "Wola", radius: "3 km" });
});

test("Zapisany użytkownik i szkic są przywracane, a szkic dopełniany domyślnymi", () => {
  const result = mergeSavedState(
    saved({
      user: { name: "Anna Kowalska", role: "Zbieram", password: "nie" },
      draft: { quantity: 12 },
    }),
    defaults,
  );
  assert.deepEqual(result.user, { name: "Anna Kowalska", role: "Zbieram" });
  assert.deepEqual(result.draft, {
    id: "",
    quantity: 12,
    share: 50,
    date: "25.10.2026",
  });
});

test("Wylogowanie (user: null) jest zachowane po odświeżeniu", () => {
  const result = mergeSavedState(saved({ user: null }), {
    ...defaults,
    user: { name: "X", role: "Y" },
  });
  assert.equal(result.user, null);
});
