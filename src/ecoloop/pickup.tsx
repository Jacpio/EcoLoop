import React, { useState } from "react";
import { Image, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  acceptOffer,
  Calculator,
  CollectionCard,
  Eligibility,
  OfferCard,
  OfferSummary,
  PrivacyNote,
  Timeline,
} from "./blocks";
import { Collection, estimate, initialDraft, Material, money } from "./domain";
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
  Input,
  MapCanvas,
  Note,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";

function validDate(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return false;
  const [, d, m, y] = match;
  const date = new Date(+y, +m - 1, +d);
  return (
    date.getDate() === +d &&
    date.getMonth() === +m - 1 &&
    date.getFullYear() === +y
  );
}
function validTime(value: string) {
  const match = /^(\d{2}):(\d{2})[–-](\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const [, h, m, endH, endM] = match.map(Number);
  return (
    h < 24 && endH < 24 && m < 60 && endM < 60 && h * 60 + m < endH * 60 + endM
  );
}
export function CreateScreen() {
  const { step: stepParam } = useLocalSearchParams<{ step?: string }>();
  const step = Math.min(3, Math.max(1, Number(stepParam) || 1));
  const desktop = useDesktop();
  const { state, update, requireUser, notify } = useEco();
  const draft = state.draft;
  const [error, setError] = useState("");
  const patch = (value: Partial<typeof draft>) =>
    update((s) => ({ ...s, draft: { ...s.draft, ...value } }));
  const next = () => {
    if (
      step === 1 &&
      (!Number.isInteger(draft.quantity) ||
        draft.quantity < 1 ||
        draft.quantity > 1000)
    ) {
      setError("Podaj liczbę całkowitą od 1 do 1000.");
      return;
    }
    if (
      step === 2 &&
      (!draft.area.trim() || !validDate(draft.date) || !validTime(draft.time))
    ) {
      setError(
        "Podaj okolicę, poprawną datę DD.MM.RRRR i przedział godzin HH:MM–HH:MM.",
      );
      return;
    }
    setError("");
    go("create", { step: String(step + 1) });
  };
  const publish = () =>
    requireUser(() => {
      const offer = {
        ...draft,
        local: true,
        id: "EL-" + Date.now().toString().slice(-6),
      };
      update((s) => ({
        ...s,
        offers: [offer, ...s.offers],
        draft: initialDraft,
      }));
      notify("Ogłoszenie opublikowane. Jest widoczne w odbiorach w okolicy.");
      go("orders", { published: offer.id });
    });
  const photo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled)
        patch({
          photo: result.assets[0].base64
            ? "data:" +
              (result.assets[0].mimeType || "image/jpeg") +
              ";base64," +
              result.assets[0].base64
            : result.assets[0].uri,
        });
    } catch {
      notify("Nie udało się otworzyć zdjęć. Sprawdź uprawnienia aplikacji.");
    }
  };
  const form = (
    <Col>
      <Badge>
        Krok {step} / 3 ·{" "}
        {step === 1 ? "Opakowania" : step === 2 ? "Odbiór" : "Podsumowanie"}
      </Badge>
      <T bold size={25}>
        {step === 1
          ? "Co chcesz oddać?"
          : step === 2
            ? "Kiedy będzie Ci wygodnie?"
            : "Wszystko się zgadza?"}
      </T>
      {step === 1 && (
        <>
          <T size={14} muted>
            Rodzaj opakowań
          </T>
          <Chips
            options={["PET", "Puszki", "Szkło"]}
            value={draft.material}
            onChange={(material) => patch({ material: material as Material })}
          />
          <Input
            label="Liczba opakowań"
            keyboardType="number-pad"
            value={draft.quantity ? String(draft.quantity) : ""}
            onChangeText={(quantity) =>
              patch({ quantity: Number(quantity.replace(/[^0-9]/g, "")) })
            }
          />
          <T size={14} muted>
            Udział zbierającego w kaucji
          </T>
          <Chips
            options={["25%", "50%", "75%", "100%"]}
            value={draft.share + "%"}
            onChange={(share) => patch({ share: parseInt(share, 10) })}
          />
          <Button secondary icon="upload" onPress={photo}>
            {draft.photo ? "Zmień zdjęcie" : "Dodaj zdjęcie · opcjonalne"}
          </Button>
          {draft.photo && (
            <Image
              source={{ uri: draft.photo }}
              style={{ width: "100%", height: 140, borderRadius: 10 }}
            />
          )}
          <Calculator offer={draft} full={false} />
          <Eligibility />
          <T muted size={12}>
            Kwoty szacunkowe. Rozliczenie MVP jest symulowane.
          </T>
          <Button onPress={next}>Dalej: miejsce i termin</Button>
        </>
      )}
      {step === 2 && (
        <>
          <Input
            label="Przybliżona okolica w ogłoszeniu"
            icon="pin"
            value={draft.area}
            onChangeText={(area) => patch({ area })}
          />
          <MapCanvas height={desktop ? 130 : 160} />
          <Input
            label="Dzień odbioru (DD.MM.RRRR)"
            icon="calendar"
            value={draft.date}
            onChangeText={(date) => patch({ date })}
          />
          <Input
            label="Okno czasowe (HH:MM–HH:MM)"
            icon="clock"
            value={draft.time}
            onChangeText={(time) => patch({ time })}
          />
          <Input
            label="Wskazówki (bez prywatnego adresu)"
            value={draft.note}
            onChangeText={(note) => patch({ note })}
          />
          <PrivacyNote />
          <Button icon="arrow" onPress={next}>
            Dalej: podsumowanie
          </Button>
          <Button secondary onPress={() => go("create", { step: "1" })}>
            Wróć do opakowań
          </Button>
        </>
      )}
      {step === 3 && (
        <>
          <OfferSummary offer={draft} />
          <Calculator offer={draft} full={false} />
          <PrivacyNote />
          <T size={13} muted>
            Publikując, akceptujesz zasady ogłoszeń. Kwoty są szacunkowe, a
            rozliczenie MVP jest symulowane.
          </T>
          <Button onPress={publish}>Opublikuj ogłoszenie</Button>
          <Button secondary onPress={() => go("create", { step: "2" })}>
            Wróć i edytuj
          </Button>
        </>
      )}
      {!!error && (
        <T color={C.brand} accessibilityRole="alert">
          {error}
        </T>
      )}
    </Col>
  );
  return (
    <Shell
      title={
        step === 1
          ? "Dodaj ogłoszenie"
          : step === 2
            ? "Miejsce i termin"
            : "Sprawdź ogłoszenie"
      }
    >
      {desktop ? (
        <>
          <Heading
            eyebrow="ODBIORY W OKOLICY"
            title="Zbieraj po drodze."
            subtitle="Wybierz ogłoszenie albo zaproś sąsiada do odbioru Twoich opakowań."
          />
          <Row style={{ gap: 24 }}>
            <Col style={{ flex: 0.8 }}>
              <Card>
                <T muted size={13}>
                  Okolica i promień
                </T>
                <T>Centrum · do 3 km</T>
              </Card>
              <T size={13} color={C.brand}>
                Sortuj: odległość / kwota / termin
              </T>
              {state.offers.slice(0, 2).map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
              <T muted size={12}>
                Przeglądanie bez konta. Zaloguj się przy przyjęciu odbioru.
              </T>
            </Col>
            <Col style={{ flex: 1.25 }}>
              <MapCanvas height={190} />
              <Calculator offer={draft} />
            </Col>
            <Card style={{ flex: 1.1, padding: 22 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T bold size={24}>
                  Twój odbiór
                </T>
                <T muted size={12}>
                  Krok {step} / 3
                </T>
              </Row>
              {form}
            </Card>
          </Row>
        </>
      ) : (
        form
      )}
    </Shell>
  );
}
export function CollectScreen() {
  const desktop = useDesktop();
  const { state } = useEco();
  const [sort, setSort] = useState("Odległość");
  const [area, setArea] = useState("");
  const [material, setMaterial] = useState("Wszystkie");
  const offers = state.offers
    .filter(
      (o) =>
        (!area || o.area.toLowerCase().includes(area.toLowerCase())) &&
        (material === "Wszystkie" || o.material === material),
    )
    .sort((a, b) =>
      sort === "Kwota"
        ? estimate(b).collector - estimate(a).collector
        : sort === "Termin"
          ? a.date
              .split(".")
              .reverse()
              .join("")
              .localeCompare(b.date.split(".").reverse().join(""))
          : parseFloat(a.distance.replace(",", ".")) -
            parseFloat(b.distance.replace(",", ".")),
    );
  return (
    <Shell title="Zbieraj w okolicy">
      {desktop && (
        <Heading
          eyebrow="ODBIORY W OKOLICY"
          title="Zbieraj po drodze."
          subtitle="Wybierz pobliskie odbiory i połącz je w jedną sensowną trasę."
          action={
            <Button icon="plus" onPress={() => go("create")}>
              Dodaj ogłoszenie
            </Button>
          }
        />
      )}
      <Row style={{ flexDirection: desktop ? "row" : "column", gap: 24 }}>
        <Col style={{ flex: desktop ? 1 : undefined }}>
          <Input
            label="Okolica · do 3 km"
            placeholder="Centrum, Wola…"
            value={area}
            onChangeText={setArea}
            icon="search"
          />
          <Chips
            options={["Odległość", "Kwota", "Termin"]}
            value={sort}
            onChange={setSort}
          />
          <Chips
            options={["Wszystkie", "PET", "Puszki", "Szkło"]}
            value={material}
            onChange={setMaterial}
          />
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {!offers.length && (
            <Empty
              title="Brak ogłoszeń"
              text="Wybierz inną okolicę lub rodzaj opakowań."
            />
          )}
          <T muted size={12}>
            Kwoty szacunkowe. Rozliczenie demo nie realizuje płatności.
          </T>
        </Col>
        {desktop && (
          <Col style={{ flex: 1.7 }}>
            <MapCanvas height={400} />
            <Calculator offer={offers[0] || initialDraft} />
            <Button secondary icon="map" onPress={() => go("plan")}>
              Przejdź do planu odbiorów
            </Button>
          </Col>
        )}
      </Row>
    </Shell>
  );
}
export function OrdersScreen() {
  const { state } = useEco();
  const { published } = useLocalSearchParams<{ published?: string }>();
  const [filter, setFilter] = useState("Aktywne");
  const desktop = useDesktop();
  const filtered = state.collections.filter((c) =>
    filter === "Aktywne"
      ? ["Przyjęty", "Odebrany"].includes(c.status)
      : filter === "Zakończone"
        ? c.status === "Zakończony"
        : c.status === "Anulowany",
  );
  return (
    <Shell title="Moje odbiory" sidebar={desktop ? "profile" : undefined}>
      {desktop && (
        <Heading
          title="Moje odbiory"
          subtitle="Wszystkie Twoje ogłoszenia i przyjęte odbiory w jednym miejscu."
          action={
            <Button onPress={() => go("create")}>Dodaj ogłoszenie</Button>
          }
        />
      )}
      <Col style={{ maxWidth: 1000 }}>
        <Chips
          options={["Aktywne", "Zakończone", "Anulowane"]}
          value={filter}
          onChange={setFilter}
        />
        {published && (
          <Note>
            Ogłoszenie {published} zostało opublikowane. Oczekuje na przyjęcie.
          </Note>
        )}
        {filtered.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
        {!filtered.length && (
          <Empty
            title={
              filter === "Aktywne"
                ? "Dobry obieg zaczyna się od Ciebie"
                : "Jeszcze tu spokojnie"
            }
            text={
              filter === "Aktywne"
                ? "Dodaj ogłoszenie lub przyjmij pierwszy odbiór w swojej okolicy."
                : "Odbiory z tym statusem pojawią się tutaj."
            }
            action="Przeglądaj odbiory"
            onPress={() => go("collect")}
          />
        )}
        <Row>
          <Button style={{ flex: 1 }} icon="plus" onPress={() => go("create")}>
            Zleć odbiór
          </Button>
          <Button
            secondary
            style={{ flex: 1 }}
            icon="map"
            onPress={() => go("plan")}
          >
            Plan odbiorów
          </Button>
        </Row>
        {state.offers.filter((o) => o.local).length > 0 && (
          <>
            <T bold size={21}>
              Twoje ogłoszenia
            </T>
            {state.offers
              .filter((o) => o.local)
              .map((o) => (
                <Card key={o.id}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <T bold>
                      {o.quantity} {o.material} · {o.area}
                    </T>
                    <Badge>Opublikowane</Badge>
                  </Row>
                  <T muted>
                    {o.date} · {o.time}
                  </T>
                  <T muted size={13}>
                    Dokładny adres podasz prywatnie po przyjęciu odbioru.
                  </T>
                </Card>
              ))}
          </>
        )}
      </Col>
    </Shell>
  );
}
export function CollectionScreen() {
  const { id = "EL-1042" } = useLocalSearchParams<{ id?: string }>();
  const { state, update, dialog, notify, requireUser } = useEco();
  const desktop = useDesktop();
  const collection = state.collections.find((c) => c.id === id);
  const offer = state.offers.find((o) => o.id === id);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  if (!collection)
    return (
      <Shell title={"Odbiór #" + id}>
        <Col>
          {offer ? (
            <>
              <OfferSummary offer={offer} />
              <Button
                onPress={() => requireUser(() => acceptOffer(offer, update))}
              >
                Przyjmij odbiór
              </Button>
            </>
          ) : (
            <Empty
              title="Nie znaleziono odbioru"
              text="Przejdź do aktualnych odbiorów w Twojej okolicy."
              action="Moje odbiory"
              onPress={() => go("orders")}
            />
          )}
        </Col>
      </Shell>
    );
  const patch = (value: Partial<Collection>) =>
    update((s) => ({
      ...s,
      collections: s.collections.map((c) =>
        c.id === id ? { ...c, ...value } : c,
      ),
    }));
  const confirmPin = () => {
    if (pin !== collection.pin) {
      setError("Nieprawidłowy PIN. W demo użyj kodu 7429.");
      return;
    }
    patch({ status: "Odebrany" });
    setError("");
    notify("Przekazanie opakowań potwierdzone. Teraz możesz podsumować zwrot.");
  };
  const complete = () =>
    dialog({
      title: "Podsumowanie zwrotu",
      body: `Podaj liczbę opakowań przyjętych w punkcie (od 0 do ${collection.actual ?? collection.quantity}). Rozliczenie pozostaje symulowane.`,
      placeholder: "Liczba przyjętych opakowań",
      initialValue: String(
        collection.returned ?? collection.actual ?? collection.quantity,
      ),
      confirm: "Zakończ odbiór",
      onConfirm: (value) => {
        const returned = Number(value);
        if (
          !Number.isInteger(returned) ||
          returned < 0 ||
          returned > (collection.actual ?? collection.quantity)
        ) {
          notify("Podaj poprawną liczbę opakowań.");
          return;
        }
        patch({ status: "Zakończony", returned });
        notify("Odbiór zakończony. Podsumowanie zapisane w historii demo.");
      },
    });
  return (
    <Shell title={"Odbiór #" + id}>
      {desktop && (
        <Heading
          title={"Odbiór #" + id}
          subtitle="Szczegóły odbioru i potwierdzenie przekazania."
        />
      )}
      <Row style={{ flexDirection: desktop ? "row" : "column", gap: 24 }}>
        <Col style={{ flex: 1 }}>
          <Badge green>{collection.status}</Badge>
          <T color={C.brand} bold size={16}>
            Przyjęty · {collection.date} · {collection.time}
          </T>
          <OfferSummary offer={collection} />
          <Card>
            <T bold size={18}>
              Prywatny adres odbioru
            </T>
            <T>{collection.address}</T>
            <T muted size={13}>
              Adres widoczny po przyjęciu. Nie udostępniaj go innym.
            </T>
          </Card>
          <Card wash>
            <T bold size={21}>
              PIN demo: {collection.pin}
            </T>
            <T size={14}>
              Podaj przy przekazaniu. PIN nie potwierdza zwrotu w kaucjomacie.
            </T>
          </Card>
          <Card>
            <Timeline collection={collection} />
          </Card>
        </Col>
        <Col style={{ flex: 1 }}>
          {collection.status === "Przyjęty" && (
            <Card>
              <T bold size={22}>
                Potwierdź przekazanie
              </T>
              <Input
                label="PIN przekazania"
                keyboardType="number-pad"
                maxLength={4}
                value={pin}
                onChangeText={setPin}
                placeholder="Wpisz 4 cyfry"
              />
              <Button onPress={confirmPin}>Potwierdź odbiór opakowań</Button>
              {!!error && (
                <T color={C.brand} accessibilityRole="alert">
                  {error}
                </T>
              )}
            </Card>
          )}
          {collection.status === "Odebrany" && (
            <Card>
              <T bold size={22}>
                Opakowania są już u Ciebie
              </T>
              <T muted>
                Oddaj je w punkcie, a następnie zapisz faktyczną liczbę
                przyjętych opakowań.
              </T>
              <Button onPress={complete}>Podsumuj zwrot w punkcie</Button>
            </Card>
          )}
          {collection.status === "Zakończony" && (
            <Card wash>
              <T bold size={24}>
                Dobry obieg domknięty.
              </T>
              <T>
                Przyjęto {collection.returned ?? collection.quantity} opakowań.
              </T>
              <Calculator
                offer={{
                  ...collection,
                  quantity: collection.returned ?? collection.quantity,
                }}
                full={false}
              />
              <T size={13} muted>
                Rozliczenie symulowane · nie wykonano płatności.
              </T>
            </Card>
          )}
          {collection.status !== "Zakończony" && (
            <Calculator
              offer={{
                ...collection,
                quantity: collection.actual ?? collection.quantity,
              }}
              full={false}
            />
          )}
          {!["Anulowany", "Zakończony"].includes(collection.status) && (
            <>
              <T bold size={20}>
                Problem z odbiorem
              </T>
              <Row>
                <Button
                  style={{ flex: 1 }}
                  secondary
                  onPress={() =>
                    dialog({
                      title: "Czat z oddającym · demo",
                      body: "Wiadomość zostanie zapisana lokalnie przy odbiorze. Nie jest wysyłana do innej osoby.",
                      placeholder: "Twoja wiadomość",
                      multiline: true,
                      confirm: "Zapisz wiadomość",
                      onConfirm: (value) => {
                        patch({ problem: "Wiadomość: " + value });
                        notify("Wiadomość zapisana przy odbiorze.");
                      },
                    })
                  }
                >
                  Czat
                </Button>
                <Button
                  style={{ flex: 1 }}
                  secondary
                  onPress={() => go("problem", { id })}
                >
                  Nieobecność
                </Button>
              </Row>
              <Button secondary onPress={() => go("shortage", { id })}>
                Inna liczba opakowań
              </Button>
              <Button secondary onPress={() => go("rejected", { id })}>
                Opakowania odrzucone przy zwrocie
              </Button>
              <Button secondary icon="map" onPress={() => go("plan")}>
                Plan odbiorów
              </Button>
            </>
          )}
          {collection.problem && <Note>{collection.problem}</Note>}
          <Button ghost onPress={() => go("orders")}>
            ← Moje odbiory
          </Button>
        </Col>
      </Row>
    </Shell>
  );
}
export function PlanScreen() {
  const { state } = useEco();
  const desktop = useDesktop();
  const active = state.collections.filter((c) =>
    ["Przyjęty", "Odebrany"].includes(c.status),
  );
  const [sort, setSort] = useState("Kolejność przyjęcia");
  const collections = [...active].sort((a, b) =>
    sort === "Godzina odbioru" ? a.time.localeCompare(b.time) : 0,
  );
  const sum = collections.reduce(
    (total, c) =>
      total + estimate({ ...c, quantity: c.actual ?? c.quantity }).collector,
    0,
  );
  return (
    <Shell title="Plan odbiorów">
      {desktop && (
        <Heading
          title="Plan odbiorów"
          subtitle="Połącz pobliskie odbiory i zaplanuj wizytę w punkcie."
        />
      )}
      <Col style={{ maxWidth: 1000, width: "100%", alignSelf: "center" }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Badge>
            {collections.length}{" "}
            {collections.length === 1 ? "odbiór" : "odbiory"} · kaucjomat
          </Badge>
          <T bold>{money(sum)} · dla Ciebie szac.</T>
        </Row>
        <Chips
          options={["Kolejność przyjęcia", "Godzina odbioru"]}
          value={sort}
          onChange={setSort}
        />
        <MapCanvas height={desktop ? 330 : 200} />
        <Card wash>
          <T bold size={20}>
            Lista odbiorów
          </T>
          {collections.map((c, i) => (
            <Card key={c.id}>
              <T bold>
                {i + 1}. {c.area} · {c.id}
              </T>
              <T muted size={14}>
                {c.date} · {c.time} · {c.quantity} {c.material} · udział{" "}
                {c.share}%
              </T>
              <Button
                secondary
                small
                onPress={() => go("collection", { id: c.id })}
              >
                Szczegóły odbioru
              </Button>
            </Card>
          ))}
          {!collections.length && (
            <Empty
              title="Twoja trasa czeka"
              text="Przyjmij odbiór, aby dodać pierwszy przystanek."
              action="Zbieraj w okolicy"
              onPress={() => go("collect")}
            />
          )}
          <Card>
            <T bold>{collections.length + 1}. Market Centrum</T>
            <T muted size={14}>
              Kaucjomat · plastik i metal · 06:00–23:00
            </T>
          </Card>
        </Card>
        <Note>
          Plan układasz samodzielnie. Automatyczna optymalizacja i nawigacja do
          wielu punktów są planowane w kolejnym etapie.
        </Note>
        <Button
          icon="navigate"
          disabled={!collections.length}
          onPress={() =>
            Linking.openURL(
              "https://www.google.com/maps/dir/?api=1&destination=Warszawa+Marszalkowska+104&waypoints=" +
                encodeURIComponent(
                  collections.map((c) => "Warszawa " + c.address).join("|"),
                ),
            )
          }
        >
          Otwórz w Mapach Google
        </Button>
      </Col>
    </Shell>
  );
}
export function ProblemScreen({
  kind,
}: {
  kind: "problem" | "shortage" | "rejected";
}) {
  const { id = "EL-1042" } = useLocalSearchParams<{ id?: string }>();
  const { state, update, dialog, notify } = useEco();
  const collection = state.collections.find((c) => c.id === id);
  const [amount, setAmount] = useState("36");
  const [reason, setReason] = useState("Brak znaku kaucji");
  const [issuePhoto, setIssuePhoto] = useState<string | undefined>();
  const desktop = useDesktop();
  const title =
    kind === "problem"
      ? "Osoba nie przyszła"
      : kind === "shortage"
        ? "Korekta ilości"
        : "Odrzucone przy zwrocie";
  if (!collection)
    return (
      <Shell title={title}>
        <Empty
          title="Wybierz odbiór"
          text="Ten scenariusz dotyczy przyjętego odbioru."
          action="Moje odbiory"
          onPress={() => go("orders")}
        />
      </Shell>
    );
  const patch = (value: Partial<Collection>) =>
    update((s) => ({
      ...s,
      collections: s.collections.map((c) =>
        c.id === id ? { ...c, ...value } : c,
      ),
    }));
  const saveAmount = () => {
    const actual = Number(amount);
    if (
      !Number.isInteger(actual) ||
      actual < 0 ||
      actual > collection.quantity
    ) {
      notify(`Wpisz liczbę od 0 do ${collection.quantity}.`);
      return;
    }
    if (kind === "shortage")
      patch({
        actual,
        problem: `Korekta ilości: ${actual} zamiast ${collection.quantity} opakowań. Zaakceptowana w demo.`,
      });
    else
      patch({
        returned: actual,
        issuePhoto,
        problem: `Odrzucone opakowania: ${collection.quantity - actual}. Powód: ${reason}.`,
      });
    notify("Zmiany zapisane przy odbiorze.");
    go("collection", { id });
  };
  return (
    <Shell title={title}>
      {desktop && <Heading title={title} />}
      <Col style={{ width: "100%", maxWidth: 560, alignSelf: "center" }}>
        <T bold color={C.brand} size={13}>
          {id} · zgłoszenie demo
        </T>
        <T bold size={25}>
          {kind === "problem"
            ? "Nie doszło do przekazania"
            : kind === "shortage"
              ? "Ustalcie rzeczywistą liczbę opakowań"
              : "Automat odrzucił część opakowań"}
        </T>
        <T muted>
          {kind === "problem"
            ? "Nie podawaj PIN-u, jeśli opakowania nadal są u Ciebie."
            : kind === "shortage"
              ? `W ogłoszeniu było ${collection.quantity} ${collection.material}. Przy przekazaniu sprawdźcie liczbę razem.`
              : "Zapisz faktyczny zwrot i powód odrzucenia. Możesz też zgłosić usterkę punktu."}
        </T>
        {kind === "problem" ? (
          <>
            <Card>
              <T>
                Najpierw napisz do drugiej osoby. Możesz zaproponować nowy
                termin albo zakończyć odbiór i ponownie udostępnić ogłoszenie.
              </T>
            </Card>
            <Button
              onPress={() =>
                dialog({
                  title: "Napisz do zbierającego · demo",
                  body: "Wiadomość zostanie zapisana lokalnie przy odbiorze.",
                  placeholder: "Wiadomość",
                  confirm: "Zapisz",
                  onConfirm: (value) => {
                    patch({ problem: value });
                    notify("Wiadomość zapisana.");
                  },
                })
              }
            >
              Napisz do zbierającego
            </Button>
            <Button
              secondary
              onPress={() =>
                dialog({
                  title: "Zaproponuj nowy termin",
                  body: "Wpisz nowy dzień i godziny odbioru. Zmiana jest symulowana.",
                  placeholder: "DD.MM.RRRR, HH:MM–HH:MM",
                  confirm: "Zaproponuj termin",
                  onConfirm: (value) => {
                    patch({ problem: "Nowy termin: " + value });
                    notify("Nowy termin zapisany przy odbiorze.");
                    go("collection", { id });
                  },
                })
              }
            >
              Zaproponuj nowy termin
            </Button>
            <Button
              secondary
              onPress={() =>
                dialog({
                  title: "Anuluj odbiór",
                  body: "Ogłoszenie będzie nadal dostępne, a ten odbiór trafi do anulowanych.",
                  confirm: "Anuluj odbiór i ponów ofertę",
                  onConfirm: () => {
                    patch({
                      status: "Anulowany",
                      problem: "Brak osoby przy odbiorze.",
                    });
                    notify("Odbiór anulowany. Oferta nadal jest dostępna.");
                    go("orders");
                  },
                })
              }
            >
              Anuluj odbiór i ponów ofertę
            </Button>
          </>
        ) : (
          <>
            <Input
              label={
                kind === "shortage"
                  ? "Rzeczywista liczba opakowań"
                  : "Liczba opakowań przyjętych przez punkt"
              }
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <Calculator
              offer={{
                ...collection,
                quantity: Math.max(0, Number(amount) || 0),
              }}
              full={false}
            />
            {kind === "rejected" && (
              <>
                <T bold>Powód odrzucenia</T>
                <Chips
                  options={["Brak znaku kaucji", "Zgniecione", "Awaria punktu"]}
                  value={reason}
                  onChange={setReason}
                />
              </>
            )}
            <Note>
              Obie osoby powinny uzgodnić zmianę. W demo akceptacja i
              rozliczenie są symulowane.
            </Note>
            {kind === "rejected" && (
              <>
                <Button
                  secondary
                  icon="upload"
                  onPress={async () => {
                    try {
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ["images"],
                        quality: 0.6,
                        base64: true,
                      });
                      if (!result.canceled)
                        setIssuePhoto(
                          result.assets[0].base64
                            ? "data:" +
                                (result.assets[0].mimeType || "image/jpeg") +
                                ";base64," +
                                result.assets[0].base64
                            : result.assets[0].uri,
                        );
                    } catch {
                      notify("Nie udało się otworzyć zdjęć.");
                    }
                  }}
                >
                  Dodaj zdjęcie do zgłoszenia
                </Button>
                {issuePhoto && (
                  <Image
                    source={{ uri: issuePhoto }}
                    style={{ height: 150, borderRadius: 10 }}
                  />
                )}
              </>
            )}
            <Button onPress={saveAmount}>
              {kind === "shortage"
                ? "Zaproponuj korektę ilości"
                : "Zapisz wyjaśnienie i korektę"}
            </Button>
            {kind === "rejected" && (
              <Button secondary onPress={() => go("point", { id: "market" })}>
                Zgłoś problem z punktem
              </Button>
            )}
          </>
        )}
        <Button ghost onPress={() => go("collection", { id })}>
          ← Otwórz odbiór
        </Button>
      </Col>
    </Shell>
  );
}
