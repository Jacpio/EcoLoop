export type Material = "PET" | "Puszki" | "Szkło";
export type Offer = {
  id: string;
  material: Material;
  quantity: number;
  share: number;
  area: string;
  date: string;
  time: string;
  note: string;
  distance: string;
  photo?: string;
  local?: boolean;
  /** The giver also accepts a BLIK transfer of their share, to `phone`. */
  blik?: boolean;
  phone?: string;
};
export type ReturnPlace = "automat" | "ręczny";
export type Collection = Offer & {
  status: "Przyjęty" | "Odebrany" | "Zakończony" | "Anulowany";
  address: string;
  pin: string;
  returnPlace?: ReturnPlace;
  /** Collector asked the machine to pay the deposit out by BLIK (demo). */
  transfer?: boolean;
  problem?: string;
  actual?: number;
  returned?: number;
  issuePhoto?: string;
};
export type Electronic = {
  id: string;
  device: string;
  condition: string;
  area: string;
  date: string;
  status: string;
  note: string;
};
export type PointCategory = "packaging" | "electronics";
export type CollectionPoint = {
  id: string;
  name: string;
  address: string;
  category: PointCategory;
  type: string;
  materials: string[];
  distance: string;
  hours: string;
  status: string;
  icon: string;
  latitude: number;
  longitude: number;
};
export const points: CollectionPoint[] = [
  {
    id: "market",
    category: "packaging",
    latitude: 52.231,
    longitude: 21.0123,
    name: "Kaucjomat – Market Centrum",
    address: "ul. Marszałkowska 104, Warszawa",
    type: "Automat",
    materials: ["Butelki PET", "Puszki"],
    distance: "0,8 km",
    hours: "06:00–23:00",
    status: "Działa",
    icon: "recycle",
  },
  {
    id: "hala",
    category: "packaging",
    latitude: 52.2384,
    longitude: 20.9992,
    name: "Punkt ręczny – Hala Mirowska",
    address: "pl. Mirowski 1, Warszawa",
    type: "Ręczny",
    materials: ["Butelki PET", "Puszki", "Szkło"],
    distance: "1,4 km",
    hours: "08:00–18:00",
    status: "Działa",
    icon: "hand",
  },
  {
    id: "elektro",
    category: "electronics",
    latitude: 52.2318,
    longitude: 20.9939,
    name: "EcoElectro – punkt Centrum",
    address: "ul. Żelazna 32, Warszawa",
    type: "Elektro",
    materials: ["Elektronika"],
    distance: "2,1 km",
    hours: "09:00–17:00",
    status: "Działa",
    icon: "plug",
  },
];
export const initialOffers: Offer[] = [
  {
    id: "EL-1042",
    material: "PET",
    quantity: 40,
    share: 50,
    area: "Centrum",
    date: "25.10.2026",
    time: "17:00–18:00",
    note: "Opakowania w jednej torbie.",
    distance: "0,6 km",
  },
  {
    id: "EL-1043",
    material: "Puszki",
    quantity: 24,
    share: 50,
    area: "Wola",
    date: "26.10.2026",
    time: "10:00–12:00",
    note: "Torba będzie gotowa przy wejściu.",
    distance: "1,6 km",
    blik: true,
    phone: "600100200",
  },
];
export const initialElectronics: Electronic[] = [
  {
    id: "EE-208",
    device: "Laptop",
    condition: "Nie działa",
    area: "Centrum",
    date: "26.10.2026 · 10:00–12:00",
    status: "Nowe",
    note: "Nie uruchamia się.",
  },
  {
    id: "EE-207",
    device: "Monitor LCD",
    condition: "Nie działa",
    area: "Wola",
    date: "27.10.2026 · 12:00–14:00",
    status: "Zaplanowane",
    note: "Odbiór z parteru.",
  },
  {
    id: "EE-206",
    device: "Telefon",
    condition: "Do oceny",
    area: "Mokotów",
    date: "28.10.2026 · 10:00–12:00",
    status: "Do oceny",
    note: "Uszkodzona bateria.",
  },
  {
    id: "EE-205",
    device: "Drukarka",
    condition: "Nie działa",
    area: "Centrum",
    date: "26.10.2026 · 14:00–16:00",
    status: "Dokumentacja",
    note: "Brak dokumentu przekazania.",
  },
  {
    id: "EE-204",
    device: "Laptop",
    condition: "Nie działa",
    area: "Wola",
    date: "24.10.2026 · 10:00–12:00",
    status: "Zakończone",
    note: "Odbiór zakończony.",
  },
];
export const depositRate = (material: Material) =>
  material === "Szkło" ? 1 : 0.5;
export const estimate = (
  offer: Pick<Offer, "quantity" | "material" | "share">,
) => {
  const totalCents = Math.round(
    offer.quantity * depositRate(offer.material) * 100,
  );
  const collectorCents = Math.round((totalCents * offer.share) / 100);
  return {
    total: totalCents / 100,
    collector: collectorCents / 100,
    owner: (totalCents - collectorCents) / 100,
  };
};
/** Nine-digit Polish number from "+48 512-345-678" style input, or null. */
export function normalizePhone(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  const match = /^(?:(?:\+|00)?48)?([1-9]\d{8})$/.exec(compact);
  return match ? match[1] : null;
}
export const formatPhone = (digits: string) =>
  digits ? `+48 ${digits.replace(/(\d{3})(?=\d)/g, "$1 ")}` : "";
export const money = (value: number) =>
  `${Number(value.toFixed(2)).toLocaleString("pl-PL")} zł`;
export const materialLabel = (material: Material) =>
  material === "PET"
    ? "butelek PET"
    : material === "Puszki"
      ? "puszek aluminiowych"
      : "butelek szklanych";
const pad = (value: number) => String(value).padStart(2, "0");
export const formatDatePl = (date: Date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
/** Fresh draft for the "add offer" flow; the date defaults to today. */
export const createDraft = (now = new Date()): Offer => ({
  ...initialOffers[0],
  id: "",
  area: "Warszawa, Centrum",
  distance: "0 km",
  date: formatDatePl(now),
});

/** Parses DD.MM.RRRR; returns null for malformed or non-existent dates. */
export function parseDatePl(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(+y, +m - 1, +d);
  return date.getDate() === +d &&
    date.getMonth() === +m - 1 &&
    date.getFullYear() === +y
    ? date
    : null;
}
export const validDate = (value: string) => parseDatePl(value) !== null;
/** Vocative of a first name for greetings: "Anna" -> "Anno" (feminine -a names only). */
export const vocative = (firstName: string) =>
  firstName.endsWith("a") ? firstName.slice(0, -1) + "o" : firstName;
export const upperFirst = (text: string) =>
  text.charAt(0).toLocaleUpperCase("pl") + text.slice(1);

/** "dziś" / "jutro" for the next two days, otherwise the date itself. */
export function relativeDay(value: string, now = new Date()) {
  const date = parseDatePl(value);
  if (!date) return value;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Rounding absorbs the 23/25-hour days around daylight-saving changes.
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  return diff === 0 ? "dziś" : diff === 1 ? "jutro" : value;
}
export function isPastDate(value: string, now = new Date()) {
  const date = parseDatePl(value);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return !!date && date < today;
}
/** HH:MM–HH:MM with a start strictly before the end. */
export function validTime(value: string) {
  const match = /^(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, h, m, endH, endM] = match.map(Number);
  return (
    h < 24 && endH < 24 && m < 60 && endM < 60 && h * 60 + m < endH * 60 + endM
  );
}
/** Lower-cases and strips Polish diacritics so "Żelazna" matches "zelazna". */
export const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l");

export function supportsArea(area: string, partnerArea: string) {
  const query = normalizeText(area);
  return partnerArea.split(",").some((value) => {
    const name = normalizeText(value.trim());
    return (
      name.length > 0 &&
      (query.includes(name) ||
        (name === "srodmiescie" && query.includes("centrum")))
    );
  });
}

const districts = [
  "centrum",
  "srodmiescie",
  "wola",
  "mokotow",
  "ochota",
  "praga",
  "zoliborz",
  "ursynow",
  "bemowo",
  "bielany",
  "targowek",
  "wawer",
  "wilanow",
  "ursus",
  "wlochy",
];
export function filterCollectionPoints({
  category,
  type = "Wszystkie",
  material = "Wszystkie",
  query = "",
  withHours = false,
}: {
  category: PointCategory;
  type?: string;
  material?: string;
  query?: string;
  withHours?: boolean;
}) {
  // The demo catalogue covers only Warsaw, so the city and district names are
  // not filters. What is left (a street, a point name) must match every word.
  const words = normalizeText(query)
    .split(/[\s,;]+/)
    .filter((word) => word && word !== "warszawa" && !districts.includes(word));
  return points.filter(
    (point) =>
      point.category === category &&
      (type === "Wszystkie" || point.type === type) &&
      (material === "Wszystkie" || point.materials.includes(material)) &&
      (!withHours || Boolean(point.hours)) &&
      words.every((word) =>
        normalizeText(`${point.name} ${point.address}`).includes(word),
      ),
  );
}
