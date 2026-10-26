import React, { useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PointCard } from "./blocks";
import { filterCollectionPoints, points, type PointCategory } from "./domain";
import * as Location from "expo-location";
import type { MapFocus } from "./maps/types";
import { useEco } from "./store";
import {
  Badge,
  Button,
  C,
  Card,
  Chips,
  Col,
  Empty,
  go,
  Heading,
  Icon,
  Input,
  LineDivider,
  MapCanvas,
  Note,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";

export function MapScreen() {
  const desktop = useDesktop();
  const params = useLocalSearchParams<{ type?: string; category?: string }>();
  const { state, notify } = useEco();
  const category: PointCategory =
    params.category === "electronics" ||
    (!params.category && params.type === "Elektro")
      ? "electronics"
      : "packaging";
  const [type, setType] = useState("Wszystkie");
  const [material, setMaterial] = useState("Wszystkie");
  const [query, setQuery] = useState(state.preferences.area);
  const [selected, setSelected] = useState<string | null>(
    category === "electronics" ? "elektro" : "market",
  );
  const [today, setToday] = useState(false);
  const [locating, setLocating] = useState(false);
  const [focus, setFocus] = useState<MapFocus>();
  const filtered = filterCollectionPoints({
    category,
    type: category === "packaging" ? type : "Wszystkie",
    material: category === "packaging" ? material : "Wszystkie",
    query,
    withHours: today,
  });
  const activeSelected = filtered.some((point) => point.id === selected)
    ? selected
    : null;
  const changeCategory = (value: PointCategory) => {
    router.setParams({ category: value });
    setType("Wszystkie");
    setMaterial("Wszystkie");
    setSelected(null);
  };
  const choose = (id: string) =>
    desktop ? setSelected(id) : go("point", { id });
  const locate = async () => {
    if (locating) return;
    setLocating(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        notify(
          "Zezwól na lokalizację, aby wyśrodkować mapę. Możesz nadal przeglądać ją ręcznie.",
        );
        return;
      }
      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("timeout")), 18000);
        }),
      ]);
      setFocus({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        key: String(Date.now()),
      });
      setSelected(null);
      notify(
        "Mapa pokazuje Twoją lokalizację. Katalog przykładowych punktów obejmuje Częstochowę.",
      );
    } catch {
      notify(
        "Nie udało się odczytać lokalizacji. Sprawdź uprawnienia i spróbuj ponownie.",
      );
    } finally {
      if (timer) clearTimeout(timer);
      setLocating(false);
    }
  };
  const categoryPicker = (
    <Col style={{ gap: 8, flexDirection: desktop ? "column" : "row" }}>
      {(
        [
          {
            id: "packaging",
            icon: "recycle",
            title: "Butelki i puszki",
            description: "Kaucjomaty i ręczny zwrot kaucji",
            color: C.brand,
            background: C.pink,
          },
          {
            id: "electronics",
            icon: "plug",
            title: "Elektronika",
            description: "Osobne punkty uprawnionych odbiorców",
            color: C.electro,
            background: C.electroBg,
          },
        ] as const
      ).map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityLabel={item.title}
          accessibilityState={{ selected: category === item.id }}
          onPress={() => changeCategory(item.id)}
          style={{
            flex: desktop ? undefined : 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: category === item.id ? item.color : C.line,
            backgroundColor: category === item.id ? item.background : C.paper,
            borderRadius: 11,
            padding: desktop ? 13 : 11,
          }}
        >
          <Icon name={item.icon} color={item.color} size={desktop ? 23 : 20} />
          <Col style={{ gap: 1, flex: 1 }}>
            <T
              bold
              size={desktop ? 16 : 14}
              color={category === item.id ? item.color : C.ink}
            >
              {item.title}
            </T>
            {desktop && (
              <T size={11} muted>
                {item.description}
              </T>
            )}
          </Col>
          {category === item.id && desktop && (
            <Icon name="check" color={item.color} size={17} />
          )}
        </Pressable>
      ))}
    </Col>
  );
  const searchField = (
    <Input
      label="Miasto lub nazwa punktu"
      value={query}
      onChangeText={(value) => {
        setQuery(value);
        setSelected(null);
      }}
      icon="search"
    />
  );
  const locateButton = (
    <Button secondary icon="target" disabled={locating} onPress={locate}>
      {locating ? "Ustalam lokalizację…" : "Użyj mojej lokalizacji"}
    </Button>
  );
  const kindFilters =
    category === "packaging" ? (
      <>
        <T bold size={14}>
          Rodzaj punktu zwrotu
        </T>
        <Chips
          options={["Wszystkie", "Automat", "Ręczny"]}
          value={type}
          onChange={(value) => {
            setType(value);
            setSelected(null);
          }}
        />
        <T bold size={14}>
          Opakowania kaucyjne
        </T>
        <Chips
          options={["Wszystkie", "Butelki PET", "Puszki", "Szkło"]}
          value={material}
          onChange={(value) => {
            setMaterial(value);
            setSelected(null);
          }}
        />
        {desktop && (
          <T size={12} muted>
            Elektronika nie trafia do kaucjomatu. Wybierz osobny widok
            „Elektronika”.
          </T>
        )}
      </>
    ) : (
      <Note>
        Elektroodpady oddajesz uprawnionemu odbiorcy. Te punkty nie przyjmują
        butelek ani puszek w ramach zwrotu kaucji.
      </Note>
    );
  const todayToggle = (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: today }}
      onPress={() => setToday(!today)}
    >
      <Row style={{ alignItems: "center", gap: 8 }}>
        <View
          style={{
            height: 19,
            width: 19,
            borderWidth: 1,
            borderColor: today ? C.brand : C.line,
            borderRadius: 4,
            backgroundColor: today ? C.brand : C.paper,
          }}
        >
          {today && <Icon name="check" size={16} color={C.paper} />}
        </View>
        <T size={13} muted>
          Pokaż punkty z podanymi godzinami
        </T>
      </Row>
    </Pressable>
  );
  const count = (
    <T>
      {filtered.length} {filtered.length === 1 ? "punkt" : "punkty"} ·{" "}
      {category === "packaging" ? "zwrot opakowań" : "elektronika"}
    </T>
  );
  // Desktop: one sidebar. Mobile: search and kind filters, then the map, then the rest.
  const filters = (
    <Col
      style={{
        width: 310,
        padding: 22,
        backgroundColor: C.paper,
        borderRightWidth: 1,
        borderColor: C.line,
      }}
    >
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <T bold size={27}>
          Znajdź punkt
        </T>
        <Badge green>Bez logowania</Badge>
      </Row>
      <T bold size={14}>
        Co chcesz oddać?
      </T>
      {categoryPicker}
      {searchField}
      {locateButton}
      {kindFilters}
      {todayToggle}
      <LineDivider />
      {count}
      {filtered.map((point) => (
        <PointCard
          key={point.id}
          id={point.id}
          onPress={() => choose(point.id)}
        />
      ))}
      {!filtered.length && (
        <T muted size={14}>
          Brak punktów dla tych filtrów. Zmień rodzaj punktu lub okolicę.
        </T>
      )}
    </Col>
  );
  const mobileTop = (
    <Col>
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Badge green>Bez logowania</Badge>
      </Row>
      {categoryPicker}
      {searchField}
      {kindFilters}
    </Col>
  );
  return (
    <Shell title="Mapa punktów" full={desktop}>
      <View
        style={{
          flex: 1,
          flexDirection: desktop ? "row" : "column",
          gap: desktop ? 0 : 16,
        }}
      >
        {desktop ? filters : mobileTop}
        <Col style={desktop ? { flex: 1, padding: 26 } : {}}>
          {desktop && (
            <Heading
              title={
                category === "packaging"
                  ? "Butelki i puszki. W dobrym obiegu."
                  : "Elektronika. We właściwym punkcie."
              }
              subtitle="Mapy Google (lub OpenStreetMap) · punkty demonstracyjne · dostępność punktów nie jest sprawdzana na żywo"
            />
          )}
          <MapCanvas
            height={desktop ? 690 : 320}
            category={category}
            pointIds={filtered.map((p) => p.id)}
            selected={activeSelected || ""}
            onSelect={choose}
            focus={focus}
            rightInset={desktop && activeSelected ? 350 : 0}
          >
            {desktop && selected && filtered.some((p) => p.id === selected) && (
              <ScrollView
                style={{
                  position: "absolute",
                  right: 16,
                  top: 20,
                  bottom: 35,
                  width: 310,
                }}
              >
                <PointDetails id={selected} onClose={() => setSelected(null)} />
              </ScrollView>
            )}
          </MapCanvas>
          <T muted size={12}>
            Przesuwaj mapę i użyj + / −, aby zmienić skalę. Znaczniki pokazują
            wyłącznie wybraną kategorię.
          </T>
          {!desktop && (
            <>
              {locateButton}
              {todayToggle}
              {count}
              {filtered.map((p) => (
                <PointCard key={p.id} id={p.id} />
              ))}
              {!filtered.length && (
                <Empty
                  title="Brak punktów"
                  text="Zmień filtry lub wyszukaj Częstochowa, Centrum."
                  action="Wyczyść filtry"
                  onPress={() => {
                    setQuery("");
                    setType("Wszystkie");
                    setMaterial("Wszystkie");
                  }}
                />
              )}
            </>
          )}
        </Col>
      </View>
    </Shell>
  );
}
export function PointScreen() {
  const { id = "market" } = useLocalSearchParams<{ id?: string }>();
  const desktop = useDesktop();
  const point = points.find((p) => p.id === id) || points[0];
  return (
    <Shell title="Szczegóły punktu">
      <View
        style={{
          maxWidth: desktop ? 1000 : 500,
          width: "100%",
          alignSelf: "center",
          gap: 20,
        }}
      >
        {desktop && <Heading title="Szczegóły punktu" />}
        <View style={{ flexDirection: desktop ? "row" : "column", gap: 24 }}>
          {desktop && (
            <View style={{ flex: 1 }}>
              <MapCanvas
                height={540}
                selected={point.id}
                category={point.category}
                pointIds={[point.id]}
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <PointDetails id={point.id} standalone />
          </View>
        </View>
      </View>
    </Shell>
  );
}
export function PointDetails({
  id,
  onClose,
  standalone,
}: {
  id: string;
  onClose?: () => void;
  standalone?: boolean;
}) {
  const point = points.find((p) => p.id === id) || points[0];
  const { state, update, dialog, notify } = useEco();
  const status = state.pointStatus[id] || point.status;
  const electronics = point.category === "electronics";
  const report = () =>
    dialog({
      title: "Zgłoś problem z punktem",
      body:
        point.name +
        ". Opisz problem. Zgłoszenie trafi do demonstracyjnego panelu administratora.",
      placeholder: "Co wymaga sprawdzenia?",
      multiline: true,
      confirm: "Wyślij zgłoszenie",
      onConfirm: (note) => {
        update((s) => ({
          ...s,
          reports: [
            {
              id: "Z-" + Date.now().toString().slice(-5),
              title: "Problem z punktem",
              target: point.name,
              priority: "Normalny",
              status: "Nowe",
              note,
            },
            ...s.reports,
          ],
        }));
        notify("Zgłoszenie zapisane w panelu administratora.");
      },
    });
  return (
    <Card style={{ padding: standalone ? 20 : 18, gap: standalone ? 14 : 10 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Badge green={status === "Działa"} amber={status !== "Działa"}>
          {status === "Działa" ? "✓" : "!"} {status} · {point.distance}
        </Badge>
        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zamknij szczegóły punktu"
            onPress={onClose}
          >
            <Icon name="close" size={18} />
          </Pressable>
        )}
      </Row>
      <Row style={{ alignItems: "center", gap: 6 }}>
        <Icon
          name={electronics ? "plug" : "recycle"}
          size={17}
          color={electronics ? C.electro : C.brand}
        />
        <T size={12} bold color={electronics ? C.electro : C.brand}>
          {electronics
            ? "ELEKTRONIKA · OSOBNY PUNKT"
            : "BUTELKI I PUSZKI · ZWROT KAUCJI"}
        </T>
      </Row>
      <T bold size={standalone ? 26 : 23}>
        {point.name}
      </T>
      <T muted size={13}>
        {point.address}
      </T>
      <LineDivider />
      <T size={14}>
        {point.materials.join(" i ")} · {point.type} · {point.hours}
      </T>
      <T muted size={13}>
        {electronics
          ? "Elektroodpady przyjmuje uprawniony odbiorca. Sprawdź zasady przekazania."
          : "Puste, niezgniecione opakowania z widocznym znakiem systemu kaucyjnego (butelki PET, puszki aluminium)."}
      </T>
      <T muted size={12}>
        Źródło: zgłoszenie użytkownika · demo 25.10.2026, 09:00 · nie status na
        żywo
      </T>
      <T bold size={13}>
        Zgłoś aktualny stan punktu:
      </T>
      <Chips
        options={
          electronics ? ["Działa", "Nieczynny"] : ["Działa", "Pełny", "Awaria"]
        }
        value={status}
        onChange={(value) => {
          update((s) => ({
            ...s,
            pointStatus: { ...s.pointStatus, [id]: value },
          }));
          notify("Stan punktu zaktualizowany w demo.");
        }}
      />
      <Button
        icon="navigate"
        onPress={() =>
          Linking.openURL(
            `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${point.latitude},${point.longitude}#map=17/${point.latitude}/${point.longitude}`,
          ).catch(() =>
            notify("Nie można otworzyć nawigacji. Adres: " + point.address),
          )
        }
      >
        Nawiguj do {point.name.split(" – ").pop()}
      </Button>
      {electronics ? (
        <>
          <Note>
            Przygotuj opis sprzętu i sprawdź warunki przekazania. Elektroodpadów
            nie odbierają osoby z giełdy opakowań.
          </Note>
          <Button secondary onPress={() => go("electro-form")}>
            Zgłoś elektronikę do partnera
          </Button>
        </>
      ) : (
        <Note>
          Alternatywa:{" "}
          {id === "hala"
            ? "Market Centrum · automat · 0,8 km · 06:00–23:00"
            : "Rynek Wieluński · ręczny · 1,4 km · 08:00–18:00"}
        </Note>
      )}
      <Button secondary onPress={report}>
        Zgłoś problem z punktem
      </Button>
      {standalone && (
        <Button ghost onPress={() => go("map", { category: point.category })}>
          ← Wróć do mapy
        </Button>
      )}
    </Card>
  );
}
