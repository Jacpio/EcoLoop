const { test } = require("node:test");
const assert = require("node:assert/strict");
const { points, filterCollectionPoints } = require("../src/ecoloop/domain.ts");
const { parseMapEvent } = require("../src/ecoloop/maps/types.ts");

test("Zwrot opakowań i elektronika pozostają rozłączne również po zmianie filtrów", () => {
  for (const category of ["packaging", "electronics"]) {
    for (const type of ["Wszystkie", "Automat", "Ręczny", "Elektro"]) {
      for (const material of ["Wszystkie", "Butelki PET", "Puszki", "Szkło"]) {
        const result = filterCollectionPoints({ category, type, material });
        assert.ok(result.every((point) => point.category === category));
      }
    }
  }
  assert.deepEqual(
    filterCollectionPoints({ category: "packaging" }).map((p) => p.id),
    ["market", "hala"],
  );
  assert.deepEqual(
    filterCollectionPoints({ category: "electronics" }).map((p) => p.id),
    ["elektro"],
  );
});
test("Szkło nie pojawia się w automacie przyjmującym wyłącznie PET i puszki", () => {
  assert.equal(
    filterCollectionPoints({
      category: "packaging",
      type: "Automat",
      material: "Szkło",
    }).length,
    0,
  );
  assert.deepEqual(
    filterCollectionPoints({ category: "packaging", material: "Szkło" }).map(
      (p) => p.id,
    ),
    ["hala"],
  );
});
test("Wyszukiwanie i filtr typu nadal zawężają zbiór wewnątrz kategorii", () => {
  assert.deepEqual(
    filterCollectionPoints({ category: "packaging", query: "wieluński" }).map(
      (p) => p.id,
    ),
    ["hala"],
  );
  assert.equal(
    filterCollectionPoints({ category: "electronics", query: "wieluński" })
      .length,
    0,
  );
  assert.equal(
    filterCollectionPoints({
      category: "packaging",
      query: "Nieistniejący punkt",
    }).length,
    0,
  );
});
test("Każdy znacznik ma unikalne ID i poprawne współrzędne mapy", () => {
  assert.equal(new Set(points.map((p) => p.id)).size, points.length);
  for (const point of points) {
    assert.ok(
      Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 85,
    );
    assert.ok(
      Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180,
    );
  }
});
test("Most mapy ignoruje obce i uszkodzone komunikaty", () => {
  for (const data of [
    null,
    "ready",
    {},
    { channel: "other", type: "select", id: "market" },
    { channel: "ecoloop-map-v1", type: "select", id: 7 },
    { channel: "ecoloop-map-v1", type: "run-script" },
  ])
    assert.equal(parseMapEvent(data), null);
  assert.deepEqual(
    parseMapEvent({ channel: "ecoloop-map-v1", type: "select", id: "market" }),
    { channel: "ecoloop-map-v1", type: "select", id: "market" },
  );
});
