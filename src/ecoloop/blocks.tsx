import React from "react";
import { Pressable, View } from "react-native";
import {
  Collection,
  depositRate,
  estimate,
  materialLabel,
  money,
  Offer,
  points,
  relativeDay,
  upperFirst,
} from "./domain";
import { useEco } from "./store";
import {
  Badge,
  Button,
  C,
  Card,
  Col,
  go,
  Icon,
  LineDivider,
  Note,
  Row,
  T,
} from "./ui";

export function acceptOffer(
  offer: Offer,
  update: ReturnType<typeof useEco>["update"],
) {
  update((s) =>
    s.collections.some((c) => c.id === offer.id && c.status !== "Anulowany")
      ? s
      : {
          ...s,
          collections: [
            ...s.collections.filter((c) => c.id !== offer.id),
            {
              ...offer,
              status: "Przyjęty",
              address: offer.area.includes("Wola")
                ? "ul. Żelazna 32, klatka B, mieszkanie 8"
                : "ul. Marszałkowska 104, klatka A, mieszkanie 12",
              pin: "7429",
            },
          ],
        },
  );
  go("collection", { id: offer.id });
}
export function OfferCard({
  offer,
  compact = false,
}: {
  offer: Offer;
  compact?: boolean;
}) {
  const { requireUser, update, state } = useEco();
  const amounts = estimate(offer);
  const accepted = state.collections.some(
    (c) => c.id === offer.id && c.status !== "Anulowany",
  );
  return (
    <Card style={{ padding: compact ? 14 : 18, gap: 6 }}>
      {compact ? (
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Badge>
            {offer.area} · {offer.distance}
          </Badge>
          <T color={C.brand} bold size={22}>
            {money(amounts.collector)}
          </T>
        </Row>
      ) : (
        <T color={C.brand} bold size={19}>
          {money(amounts.collector)} dla Ciebie · szac.
        </T>
      )}
      <T bold>
        {offer.quantity} {offer.material} · ok.{" "}
        {offer.quantity > 30 ? "2–3 torby" : "1 torba"}
      </T>
      {!compact && (
        <T size={14}>
          {offer.area} · {offer.distance} · {relativeDay(offer.date)}{" "}
          {offer.time}
        </T>
      )}
      <T muted size={13}>
        Kaucja szac. {money(amounts.total)} · Twój udział {offer.share}%
      </T>
      {offer.blik && <Badge green>Gotówka lub BLIK</Badge>}
      {compact && (
        <T size={14}>
          {upperFirst(relativeDay(offer.date))}, {offer.time}
        </T>
      )}
      {!compact && (
        <Button
          secondary={offer.id !== "EL-1042"}
          onPress={() =>
            accepted
              ? go("collection", { id: offer.id })
              : requireUser(() => acceptOffer(offer, update))
          }
        >
          {accepted ? "Szczegóły odbioru" : "Przyjmij odbiór"}
        </Button>
      )}
    </Card>
  );
}
export function Calculator({
  offer,
  full = true,
}: {
  offer: Offer;
  full?: boolean;
}) {
  const amounts = estimate(offer);
  return (
    <Card wash>
      <T bold size={19}>
        {full ? "Kalkulator kaucji" : "Szacunkowy podział kaucji"}
      </T>
      <Row style={{ justifyContent: "space-between" }}>
        <T muted size={14}>
          {offer.quantity} {offer.material} ×{" "}
          {money(depositRate(offer.material))}
        </T>
        <T bold>{money(amounts.total)}</T>
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        <T muted size={14}>
          Zbierający · {offer.share}%
        </T>
        <T bold>{money(amounts.collector)}</T>
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        <T muted size={14}>
          Oddający · {100 - offer.share}%
        </T>
        <T bold>{money(amounts.owner)}</T>
      </Row>
      {full && (
        <>
          <Eligibility />
          <T muted size={12}>
            Kwoty szacunkowe do rzeczywistego zwrotu. MVP symuluje rozliczenie,
            nie realizuje płatności.
          </T>
        </>
      )}
    </Card>
  );
}
export function Eligibility() {
  return (
    <Card style={{ padding: 14, backgroundColor: "transparent" }}>
      <T bold size={17}>
        Czy opakowanie się kwalifikuje?
      </T>
      <T size={14}>
        Znak kaucji i czytelna etykieta. Opakowanie puste i niezgniecione.
      </T>
      <T color={C.brand} bold size={13}>
        Bez znaku kaucji nie wliczaj do szacunku.
      </T>
    </Card>
  );
}
export function PointCard({
  id,
  onPress,
}: {
  id: string;
  onPress?: () => void;
}) {
  const p = points.find((p) => p.id === id) || points[0];
  const { state } = useEco();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.name}
      onPress={onPress || (() => go("point", { id }))}
    >
      <Card style={{ gap: 9, padding: 15 }}>
        <Row style={{ alignItems: "center", gap: 6 }}>
          <Icon
            name={p.category === "electronics" ? "plug" : "recycle"}
            size={14}
            color={p.category === "electronics" ? C.electro : C.brand}
          />
          <T
            size={11}
            color={p.category === "electronics" ? C.electro : C.brand}
          >
            {p.category === "electronics"
              ? "ELEKTRONIKA · UPRAWNIONY ODBIORCA"
              : "OPAKOWANIA KAUCYJNE"}
          </T>
        </Row>
        <Row style={{ alignItems: "center" }}>
          <View
            style={{
              backgroundColor:
                p.category === "electronics" ? C.electroBg : C.pink,
              padding: 9,
              borderRadius: 12,
            }}
          >
            <Icon
              name={p.icon}
              color={p.category === "electronics" ? C.electro : C.brand}
            />
          </View>
          <Col style={{ flex: 1, gap: 3 }}>
            <T size={15}>{p.name}</T>
            <T muted size={12}>
              {p.distance} · {p.materials.join(" i ").toLowerCase()}
            </T>
          </Col>
        </Row>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Badge
            green={(state.pointStatus[id] || p.status) === "Działa"}
            amber={(state.pointStatus[id] || p.status) !== "Działa"}
          >
            {state.pointStatus[id] || p.status}
          </Badge>
          <T muted size={12}>
            {p.hours}
          </T>
        </Row>
        <T muted size={11}>
          Aktualizacja demo: 25.10.2026, 09:00
        </T>
      </Card>
    </Pressable>
  );
}
export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <T bold>
          {collection.id} · {collection.quantity} {collection.material}
        </T>
        <Badge green={collection.status !== "Anulowany"}>
          {collection.status}
        </Badge>
      </Row>
      <T muted size={14}>
        {collection.area} · {collection.date} · {collection.time}
      </T>
      <Button secondary onPress={() => go("collection", { id: collection.id })}>
        Szczegóły / PIN
      </Button>
    </Card>
  );
}
export function Timeline({ collection }: { collection: Collection }) {
  const done = collection.status === "Zakończony";
  const picked = collection.status === "Odebrany" || done;
  return (
    <Col>
      {[
        ["Ogłoszenie dodane", "Okolica, termin i podział kaucji", true],
        ["Odbiór przyjęty", "Dokładny adres jest już dostępny", true],
        ["Przekazanie opakowań", "Potwierdź PIN-em przy odbiorze", picked],
        ["Zwrot i podsumowanie", "Szacunkowe rozliczenie demo", done],
      ].map(([title, text, active]) => (
        <Row key={String(title)} style={{ alignItems: "flex-start" }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: active ? C.pink : C.wash,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon
              name={active ? "check" : "clock"}
              size={14}
              color={active ? C.brand : C.muted}
            />
          </View>
          <Col style={{ flex: 1, gap: 2 }}>
            <T size={14}>{title}</T>
            <T size={12} muted>
              {text}
            </T>
          </Col>
        </Row>
      ))}
    </Col>
  );
}
export function OfferSummary({ offer }: { offer: Offer }) {
  return (
    <Card>
      <Row style={{ alignItems: "center" }}>
        <Icon name="box" size={28} color={C.brand} />
        <Col style={{ gap: 3 }}>
          <T size={21}>
            {offer.quantity} {materialLabel(offer.material)}
          </T>
          <T muted size={13}>
            {offer.photo
              ? "Zdjęcie dodane"
              : "Zdjęcie: nie dodano · opcjonalne"}
          </T>
        </Col>
      </Row>
      <LineDivider />
      <T bold>
        {offer.area} · {offer.date}, {offer.time}
      </T>
      <T muted>{offer.note}</T>
      {offer.blik && <T muted size={13}>Rozliczenie: gotówka lub BLIK.</T>}
    </Card>
  );
}
export function PrivacyNote() {
  return (
    <Note>
      Dokładny adres jest ukryty. Zobaczy go prywatnie przyjęty zbierający.
    </Note>
  );
}
