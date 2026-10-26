const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createDraft,
  depositRate,
  estimate,
  filterCollectionPoints,
  formatDatePl,
  formatPhone,
  isPastDate,
  normalizeText,
  normalizePhone,
  parseCount,
  parseDatePl,
  relativeDay,
  supportsArea,
  upperFirst,
  validDate,
  validTime,
  vocative,
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

test("Etykiety dni: dziś, jutro lub data, także wokół zmiany czasu", () => {
  const saturday = new Date(2026, 9, 24, 23, 59);
  assert.equal(relativeDay("24.10.2026", saturday), "dziś");
  assert.equal(relativeDay("25.10.2026", saturday), "jutro");
  assert.equal(relativeDay("26.10.2026", saturday), "26.10.2026");
  assert.equal(relativeDay("23.10.2026", saturday), "23.10.2026");
  // 25.10.2026 has 25 hours (clocks go back), 26.10 must still be "jutro".
  const changeDay = new Date(2026, 9, 25, 0, 30);
  assert.equal(relativeDay("25.10.2026", changeDay), "dziś");
  assert.equal(relativeDay("26.10.2026", changeDay), "jutro");
  assert.equal(relativeDay("nie data", changeDay), "nie data");
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
    filterCollectionPoints({ category: "electronics", query: "KILINSKIEGO" }).map(
      (p) => p.id,
    ),
    ["elektro"],
  );
  assert.deepEqual(
    filterCollectionPoints({ category: "packaging", query: "najswietszej" }).map(
      (p) => p.id,
    ),
    ["market"],
  );
});

test("Ulica z miastem nadal zawęża wyniki, a słowa muszą pasować wszystkie", () => {
  const ids = (query, category = "packaging") =>
    filterCollectionPoints({ category, query }).map((p) => p.id);
  assert.deepEqual(ids("Najświętszej Maryi Panny 64, Częstochowa"), ["market"]);
  assert.deepEqual(ids("czestochowa, wielunski"), ["hala"]);
  assert.deepEqual(ids("Kilińskiego, Częstochowa", "electronics"), ["elektro"]);
  assert.deepEqual(ids("Maryi Panny 999"), []);
  assert.deepEqual(ids("Tysiąclecie"), ["market", "hala"]);
  assert.deepEqual(ids("Nieistniejący punkt"), []);
});

test("Zapytanie o miasto (z dzielnicą) pokazuje cały katalog, a puste pole też", () => {
  const all = ["market", "hala"];
  for (const query of ["", "  ", "Częstochowa", "czestochowa, centrum", "Częstochowa, Raków"])
    assert.deepEqual(
      filterCollectionPoints({ category: "packaging", query }).map((p) => p.id),
      all,
      query,
    );
});

test("Obszar partnera: dzielnice, polskie znaki i alias Śródmieście → Centrum", () => {
  const partner = "Śródmieście, Tysiąclecie, Raków";
  assert.ok(supportsArea("Częstochowa, Centrum", partner));
  assert.ok(supportsArea("czestochowa tysiaclecie", partner));
  assert.ok(supportsArea("RAKOW", partner));
  assert.equal(supportsArea("Północ", partner), false);
  assert.equal(supportsArea("Częstochowa", ""), false);
  assert.equal(supportsArea("Raków", " , "), false);
});

test("Wołacz w powitaniu i wielka pierwsza litera", () => {
  assert.equal(vocative("Anna"), "Anno");
  assert.equal(vocative("Ola"), "Olo");
  assert.equal(vocative("Piotr"), "Piotr");
  assert.equal(upperFirst("dziś, 17:00–18:00"), "Dziś, 17:00–18:00");
  assert.equal(upperFirst(""), "");
});

test("Numer telefonu: akceptuje 9 cyfr z prefiksem lub separatorami, resztę odrzuca", () => {
  for (const value of [
    "512345678",
    "512 345 678",
    "512-345-678",
    "+48 512 345 678",
    "48512345678",
    "0048 512 345 678",
  ])
    assert.equal(normalizePhone(value), "512345678", value);
  for (const value of [
    "",
    "   ",
    "12345678",
    "5123456789",
    "012345678",
    "abc",
    "+49 512 345 678",
    "512 345 67a",
  ])
    assert.equal(normalizePhone(value), null, value);
});

test("Numer telefonu jest wyświetlany jako +48 XXX XXX XXX", () => {
  assert.equal(formatPhone("512345678"), "+48 512 345 678");
  assert.equal(formatPhone(""), "");
  assert.equal(formatPhone("abc"), "abc");
});

test("Liczba opakowań: tylko cyfry, puste pole i zapis naukowy to nie zero", () => {
  assert.equal(parseCount("36"), 36);
  assert.equal(parseCount(" 0 "), 0);
  for (const value of ["", "   ", "1e1", "0x10", "-3", "1.5", "abc", "12abc"])
    assert.equal(parseCount(value), null, JSON.stringify(value));
});
