const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createDraft,
  depositRate,
  estimate,
  filterCollectionPoints,
  formatDatePl,
  isPastDate,
  normalizeText,
  parseDatePl,
  supportsArea,
  validDate,
  validTime,
} = require("../src/ecoloop/domain.ts");

test("Stawki kaucji: PET i puszki 0,50 zł, szkło 1 zł", () => {
  assert.equal(depositRate("PET"), 0.5);
  assert.equal(depositRate("Puszki"), 0.5);
  assert.equal(depositRate("Szkło"), 1);
});

test("Kalkulator odtwarza przykłady ze wzorca (40 PET → 20 zł, korekta 36 → 18 zł)", () => {
  assert.deepEqual(estimate({ material: "PET", quantity: 40, share: 50 }), {
    total: 20,
    collector: 10,
    owner: 10,
  });
  assert.deepEqual(estimate({ material: "PET", quantity: 36, share: 50 }), {
    total: 18,
    collector: 9,
    owner: 9,
  });
  assert.deepEqual(estimate({ material: "Szkło", quantity: 10, share: 25 }), {
    total: 10,
    collector: 2.5,
    owner: 7.5,
  });
});

test("Podział kaucji zawsze sumuje się do całości co do grosza", () => {
  for (const material of ["PET", "Puszki", "Szkło"])
    for (const share of [0, 25, 33, 50, 75, 100])
      for (let quantity = 0; quantity <= 250; quantity++) {
        const { total, collector, owner } = estimate({
          material,
          quantity,
          share,
        });
        assert.equal(
          Math.round((collector + owner) * 100),
          Math.round(total * 100),
          `${material} ${quantity} szt. ${share}%`,
        );
        assert.ok(collector >= 0 && owner >= 0);
      }
});

test("Daty: poprawne, nieistniejące i błędny format", () => {
  assert.ok(validDate("25.10.2026"));
  assert.ok(validDate("29.02.2028"));
  for (const value of [
    "29.02.2027",
    "31.04.2026",
    "00.10.2026",
    "25.13.2026",
    "2026-10-25",
    "25/10/2026",
    "5.10.2026",
    "",
  ])
    assert.equal(validDate(value), false, value);
  assert.equal(parseDatePl("25.10.2026").getMonth(), 9);
});

test("Daty z przeszłości są rozpoznawane względem podanego dnia", () => {
  const now = new Date(2026, 9, 25, 18, 30);
  assert.equal(isPastDate("24.10.2026", now), true);
  assert.equal(isPastDate("25.10.2026", now), false);
  assert.equal(isPastDate("26.10.2026", now), false);
  assert.equal(isPastDate("nie data", now), false);
});

test("Okno czasowe: kolejność godzin, zakresy i separator", () => {
  assert.ok(validTime("17:00–18:00"));
  assert.ok(validTime("17:00-18:00"));
  assert.ok(validTime("09:30 – 10:15"));
  for (const value of [
    "18:00–17:00",
    "17:00–17:00",
    "24:00–25:00",
    "17:60–18:00",
    "17:00",
    "5:00–6:00",
    "",
  ])
    assert.equal(validTime(value), false, value);
});

test("Nowy szkic ogłoszenia ma dzisiejszą datę i nie dzieli stanu z poprzednim", () => {
  const now = new Date(2027, 0, 5);
  const draft = createDraft(now);
  assert.equal(draft.date, "05.01.2027");
  assert.equal(formatDatePl(now), "05.01.2027");
  assert.equal(draft.id, "");
  assert.equal(draft.quantity, 40);
  assert.notEqual(createDraft(now), draft);
  assert.equal(isPastDate(draft.date, now), false);
});

test("Wyszukiwanie ignoruje wielkość liter i polskie znaki", () => {
  assert.equal(normalizeText("Żelazna ŁÓDŹ"), "zelazna lodz");
  assert.deepEqual(
    filterCollectionPoints({ category: "electronics", query: "ZELAZNA" }).map(
      (p) => p.id,
    ),
    ["elektro"],
  );
  assert.deepEqual(
    filterCollectionPoints({ category: "packaging", query: "marszalkowska" }).map(
      (p) => p.id,
    ),
    ["market"],
  );
});

test("Zapytanie o miasto (z dzielnicą) pokazuje cały katalog, a puste pole też", () => {
  const all = ["market", "hala"];
  for (const query of ["", "  ", "Warszawa", "warszawa, centrum", "Warszawa, Wola"])
    assert.deepEqual(
      filterCollectionPoints({ category: "packaging", query }).map((p) => p.id),
      all,
      query,
    );
});

test("Obszar partnera: dzielnice, polskie znaki i alias Śródmieście → Centrum", () => {
  const partner = "Śródmieście, Wola, Mokotów";
  assert.ok(supportsArea("Warszawa, Centrum", partner));
  assert.ok(supportsArea("warszawa wola", partner));
  assert.ok(supportsArea("MOKOTOW", partner));
  assert.equal(supportsArea("Praga", partner), false);
  assert.equal(supportsArea("Warszawa", ""), false);
  assert.equal(supportsArea("Wola", " , "), false);
});
