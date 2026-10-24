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
};
export type Collection = Offer & {
  status: "Przyjęty" | "Odebrany" | "Zakończony" | "Anulowany";
  address: string;
  pin: string;
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
export const money = (value: number) =>
  `${Number(value.toFixed(2)).toLocaleString("pl-PL")} zł`;
export const materialLabel = (material: Material) =>
  material === "PET"
    ? "butelek PET"
    : material === "Puszki"
      ? "puszek aluminiowych"
      : "butelek szklanych";
export const initialDraft: Offer = {
  ...initialOffers[0],
  id: "",
  area: "Warszawa, Centrum",
  distance: "0 km",
};

export function supportsArea(area: string, partnerArea: string) {
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("pl")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l");
  const query = normalize(area);
  return partnerArea.split(",").some((value) => {
    const name = normalize(value.trim());
    return (
      name.length > 0 &&
      (query.includes(name) ||
        (name === "srodmiescie" && query.includes("centrum")))
    );
  });
}

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
  const search = query.trim().toLocaleLowerCase("pl");
  return points.filter(
    (point) =>
      point.category === category &&
      (type === "Wszystkie" || point.type === type) &&
      (material === "Wszystkie" || point.materials.includes(material)) &&
      (!withHours || Boolean(point.hours)) &&
      (!search ||
        search === "warszawa, centrum" ||
        search === "warszawa" ||
        `${point.name} ${point.address}`
          .toLocaleLowerCase("pl")
          .includes(search)),
  );
}
