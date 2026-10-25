import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Stat } from "./account";
import { Electronic, supportsArea } from "./domain";
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
  LineDivider,
  Note,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";

function Table({
  headers,
  rows,
  onSelect,
}: {
  headers: string[];
  rows: string[][];
  onSelect: (index: number) => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: C.line,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: C.paper,
      }}
    >
      <Row style={{ backgroundColor: C.wash, padding: 14, gap: 10 }}>
        {headers.map((h) => (
          <T key={h} bold size={13} muted style={{ flex: 1 }}>
            {h}
          </T>
        ))}
      </Row>
      {rows.map((row, i) => (
        <Pressable
          key={row[0]}
          accessibilityRole="button"
          accessibilityLabel={row.join(", ")}
          onPress={() => onSelect(i)}
          style={{
            flexDirection: "row",
            padding: 14,
            borderTopWidth: 1,
            borderColor: C.line,
            gap: 10,
          }}
        >
          {row.map((cell, j) => (
            <T
              key={j}
              size={13}
              color={j === row.length - 1 ? C.brand : C.ink}
              style={{ flex: 1 }}
            >
              {cell}
            </T>
          ))}
        </Pressable>
      ))}
    </View>
  );
}
export function PartnerScreen() {
  const desktop = useDesktop();
  const { state, update, dialog, notify } = useEco();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [filter, setFilter] = useState(
    section === "Harmonogram"
      ? "Zaplanowane"
      : section === "Dokumentacja"
        ? "Dokumentacja"
        : "Wszystkie",
  );
  const [selectedId, setSelected] = useState("EE-208");
  const selected =
    state.electronics.find((e) => e.id === selectedId) || state.electronics[0];
  const [date, setDate] = useState("26.10.2026 · 10:00–12:00");
  const [status, setStatus] = useState("Zaplanowane");
  const rows = state.electronics.filter((e) =>
    filter === "Wszystkie" ? e.status !== "Darowizna" : e.status === filter,
  );
  const patch = (values: Partial<Electronic>) => {
    if (!selected) return;
    update((s) => ({
      ...s,
      electronics: s.electronics.map((e) =>
        e.id === selected.id ? { ...e, ...values } : e,
      ),
    }));
  };
  const detail = selected && (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <T bold size={22}>
          {selected.id}
        </T>
        <Badge>{selected.status}</Badge>
      </Row>
      <T size={19}>
        {selected.device} · {selected.condition.toLowerCase()}
      </T>
      <T size={13} muted>
        Anna K. · {selected.area} · zgłoszenie demo
      </T>
      <Note amber>
        Elektroodpad niesprawny. Odbiór wyłącznie przez uprawnionego partnera
        EcoElectro.
      </Note>
      <Card wash style={{ padding: 10 }}>
        <T size={13}>
          Obszar: {selected.area}{" "}
          {supportsArea(selected.area, state.partnerArea)
            ? "✓ — w zasięgu obsługi partnera"
            : "— poza obszarem obsługi partnera"}
        </T>
      </Card>
      <T muted size={13}>
        {selected.note}
      </T>
      <Input
        label="Proponowany termin"
        icon="calendar"
        value={date}
        onChangeText={setDate}
      />
      <T size={14}>Status zgłoszenia</T>
      <Chips
        options={["Zaplanowane", "Dokumentacja", "Zakończone"]}
        value={status}
        onChange={setStatus}
      />
      <Button
        secondary
        icon="upload"
        onPress={() =>
          dialog({
            title: "Dokument przekazania · demo",
            body: "Dodaj nazwę dokumentu do lokalnej dokumentacji zgłoszenia.",
            placeholder: "Nazwa dokumentu",
            confirm: "Dodaj dokument demo",
            onConfirm: (name) => {
              patch({ note: selected.note + "\nDokument demo: " + name });
              notify("Dokument demo zapisany przy zgłoszeniu.");
            },
          })
        }
      >
        Dodaj dokument po odbiorze
      </Button>
      <Button
        onPress={() => {
          if (!date.trim()) {
            notify("Podaj proponowany termin.");
            return;
          }
          patch({ status, date });
          notify("Termin i status zgłoszenia zapisane.");
        }}
      >
        Zapisz termin i status
      </Button>
      <T muted size={12}>
        Dane demonstracyjne. Zapis nie potwierdza rzeczywistego odbioru.
      </T>
    </Card>
  );
  return (
    <Shell title="Partner elektro" sidebar="partner">
      <Heading
        eyebrow="ECOELECTRO / ODBIORCA UPRAWNIONY"
        title={
          section && section !== "Zgłoszenia"
            ? section
            : "Sprzęt we właściwych rękach."
        }
        subtitle="Elektroodpady wyłącznie do uprawnionego odbiorcy. Sprawne urządzenia — osobna ścieżka darowizny."
        action={desktop && <Badge>Obszar: Centrum, Wola, Mokotów</Badge>}
      />
      <Col>
        <Row style={{ flexDirection: desktop ? "row" : "column" }}>
          <Stat
            label="Nowe zgłoszenia"
            value={String(
              state.electronics.filter((e) => e.status === "Nowe").length,
            )}
            text="Oczekują na ocenę stanu"
          />
          <Stat
            label="Zaplanowane odbiory"
            value={String(
              state.electronics.filter((e) => e.status === "Zaplanowane")
                .length,
            )}
            text="Najbliższy: 26.10, 10:00"
          />
          <Stat
            label="Dokumenty do uzupełnienia"
            value={String(
              state.electronics.filter((e) => e.status === "Dokumentacja")
                .length,
            )}
            text="Wymagane przed zamknięciem"
          />
        </Row>
        <Row style={{ flexDirection: desktop ? "row" : "column", gap: 24 }}>
          <Col style={{ flex: 2 }}>
            <Chips
              options={["Wszystkie", "Nowe", "Zaplanowane", "Dokumentacja"]}
              value={filter}
              onChange={setFilter}
            />
            {rows.length ? (
              <Table
                headers={["Zgłoszenie", "Urządzenie", "Okolica", "Status"]}
                rows={rows.map((e) => [
                  e.id,
                  `${e.device} · ${e.condition.toLowerCase()}`,
                  e.area,
                  e.status,
                ])}
                onSelect={(i) => {
                  setSelected(rows[i].id);
                  setDate(rows[i].date);
                  setStatus(rows[i].status);
                }}
              />
            ) : (
              <Empty
                title="Brak zgłoszeń"
                text="Zmień filtr albo dodaj zgłoszenie elektroniki."
              />
            )}
            <Card>
              <Row style={{ justifyContent: "space-between" }}>
                <T size={21}>Obszar obsługi</T>
                <Button
                  ghost
                  small
                  onPress={() =>
                    dialog({
                      title: "Obszar obsługi",
                      body: "Podaj dzielnice obsługiwane przez partnera demo.",
                      placeholder: "Dzielnice",
                      initialValue: state.partnerArea,
                      confirm: "Zapisz",
                      onConfirm: (value) => {
                        update((s) => ({ ...s, partnerArea: value }));
                        notify("Obszar obsługi zapisany.");
                      },
                    })
                  }
                >
                  Edytuj →
                </Button>
              </Row>
              <T size={14}>Warszawa: {state.partnerArea}</T>
              <T muted size={13}>
                {state.partnerHours} · odbiór po potwierdzeniu terminu
              </T>
              <LineDivider />
              <T bold size={15}>
                Dokumentacja partnera
              </T>
              <T muted size={13}>
                Potwierdzenia przekazania i uprawnienia pozostają częścią
                procedury partnera.
              </T>
              <Button secondary onPress={() => go("electro-form")}>
                Dodaj zgłoszenie elektroniki
              </Button>
            </Card>
            {section === "Zespół" && (
              <Card>
                <T bold>Zespół demo</T>
                <T>Anna Nowak · koordynatorka odbiorów</T>
                <T muted>Piotr Wiśniewski · odbiór i dokumentacja</T>
                <Note>
                  Przykładowy zespół partnera w wersji demonstracyjnej.
                </Note>
              </Card>
            )}
          </Col>
          <View style={{ flex: 1 }}>{detail}</View>
        </Row>
      </Col>
    </Shell>
  );
}
export function AdminScreen() {
  const desktop = useDesktop();
  const { state, update, dialog, notify } = useEco();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [filter, setFilter] = useState(
    section === "Nadużycia"
      ? "Nadużycia"
      : section === "Punkty i usterki"
        ? "Usterki"
        : "Wszystkie",
  );
  const [selectedId, setSelected] = useState("Z-071");
  const selected =
    state.reports.find((r) => r.id === selectedId) || state.reports[0];
  const [status, setStatus] = useState(selected?.status || "Nowe");
  const filtered = state.reports.filter(
    (r) =>
      filter === "Wszystkie" ||
      (filter === "Usterki"
        ? /automat|problem|usterk/i.test(r.title)
        : filter === "Nadużycia"
          ? /naduży/i.test(r.title)
          : /godzin|punkt/i.test(r.title)),
  );
  const addPoint = () =>
    dialog({
      title: "Dodaj punkt · demo",
      body: "Nowy punkt trafi do kolejki weryfikacji administratora. Podaj nazwę i adres.",
      placeholder: "Nazwa punktu, adres",
      confirm: "Dodaj do weryfikacji",
      onConfirm: (value) => {
        update((s) => ({
          ...s,
          reports: [
            {
              id: "Z-" + Date.now().toString().slice(-5),
              title: "Nowy punkt do weryfikacji",
              target: value,
              priority: "Normalny",
              status: "Nowe",
              note: "Punkt wymaga potwierdzenia lokalizacji, godzin i przyjmowanych opakowań.",
            },
            ...s.reports,
          ],
        }));
        notify("Punkt dodany do kolejki weryfikacji demo.");
      },
    });
  const exportRows = () => {
    const content =
      "\uFEFFSprawa;Dotyczy;Priorytet;Status\n" +
      state.reports
        .map((r) =>
          [r.id, r.target, r.priority, r.status]
            .map((v) => '"' + v.replace(/"/g, '""') + '"')
            .join(";"),
        )
        .join("\n");
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const url = URL.createObjectURL(
        new Blob([content], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "ecoloop-zgloszenia.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else dialog({ title: "Zestawienie zgłoszeń", body: content });
  };
  const save = () => {
    if (!selected) return;
    update((s) => ({
      ...s,
      reports: s.reports.map((r) =>
        r.id === selected.id ? { ...r, status } : r,
      ),
    }));
    notify("Status sprawy zapisany.");
  };
  const manage = (kind: "users" | "rewards") =>
    kind === "rewards"
      ? go("rewards")
      : dialog({
          title: "Użytkownicy demo",
          body: "Anna Kowalska · aktywna\nUżytkownik U-084 · wymaga sprawdzenia\nMożesz dodać notatkę do sprawy użytkownika.",
          placeholder: "Notatka administratora",
          confirm: "Zapisz notatkę",
          onConfirm: (note) => {
            update((s) => ({
              ...s,
              reports: [
                {
                  id: "Z-" + Date.now().toString().slice(-5),
                  title: "Przegląd użytkownika",
                  target: "Użytkownik U-084",
                  priority: "Normalny",
                  status: "W trakcie sprawdzania",
                  note,
                },
                ...s.reports,
              ],
            }));
            notify("Notatka zapisana w kolejce spraw.");
          },
        });
  return (
    <Shell title="Administrator" sidebar="admin">
      <Heading
        eyebrow="ADMINISTRACJA / DANE PRZYKŁADOWE"
        title={
          section && section !== "Przegląd"
            ? section
            : "Porządek w całym obiegu."
        }
        subtitle="Przegląd zgłoszeń i narzędzia moderacji EcoLoop."
        action={
          desktop && (
            <Button icon="plus" onPress={addPoint}>
              Dodaj punkt
            </Button>
          )
        }
      />
      <Col>
        <Row style={{ flexDirection: desktop ? "row" : "column" }}>
          <Stat
            label="Punkty w bazie demo"
            value="48"
            text="6 wymaga aktualizacji"
          />
          <Stat
            label="Otwarte sprawy"
            value={String(
              state.reports.filter((r) => r.status !== "Rozwiązane").length,
            )}
            text="Zgłoszenia do weryfikacji"
          />
          <Stat
            label="Zgłoszenia nadużyć"
            value={String(
              state.reports.filter((r) => /naduży/i.test(r.title)).length,
            )}
            text="Wymagają rozpatrzenia"
          />
          <Stat
            label="Użytkownicy demo"
            value="256"
            text="18 aktywnych w scenariuszu"
          />
        </Row>
        <Row style={{ flexDirection: desktop ? "row" : "column", gap: 24 }}>
          <Col style={{ flex: 2 }}>
            <Row
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <T size={21}>Do sprawdzenia</T>
              <Button ghost small onPress={exportRows}>
                Eksport zestawienia →
              </Button>
            </Row>
            <Chips
              options={["Wszystkie", "Usterki", "Nadużycia", "Punkty"]}
              value={filter}
              onChange={setFilter}
            />
            {filtered.length ? (
              <Table
                headers={["Sprawa", "Dotyczy", "Priorytet", "Działanie"]}
                rows={filtered.map((r) => [
                  r.id,
                  r.target,
                  r.priority,
                  r.status === "Rozwiązane" ? "Rozwiązane ✓" : "Sprawdź →",
                ])}
                onSelect={(i) => {
                  setSelected(filtered[i].id);
                  setStatus(filtered[i].status);
                }}
              />
            ) : (
              <Empty
                title="Brak spraw"
                text="Nie ma zgłoszeń pasujących do tego filtra."
              />
            )}
            <Row style={{ flexDirection: desktop ? "row" : "column" }}>
              <Card style={{ flex: 1 }}>
                <T size={21}>Użytkownicy</T>
                <T muted size={14}>
                  Konta do przeglądu. Historia zgłoszeń i ograniczenia dostępu.
                </T>
                <Button secondary onPress={() => manage("users")}>
                  Zarządzaj kontami
                </Button>
              </Card>
              <Card style={{ flex: 1 }}>
                <T size={21}>Nagrody</T>
                <T muted size={14}>
                  Przykładowy katalog nagród. Kawa na własny kubek: 800 pkt.
                </T>
                <Button secondary onPress={() => manage("rewards")}>
                  Zarządzaj katalogiem
                </Button>
              </Card>
            </Row>
            {!desktop && (
              <Button icon="plus" onPress={addPoint}>
                Dodaj punkt do weryfikacji
              </Button>
            )}
          </Col>
          <View style={{ flex: 0.9 }}>
            {selected && (
              <Card>
                <Badge amber>{selected.id} · sprawa</Badge>
                <T bold size={24}>
                  {selected.title}
                </T>
                <T muted size={13}>
                  {selected.target} · zgłoszenie demo
                </T>
                <LineDivider />
                <T size={14}>„{selected.note}”</T>
                <T size={14}>Status sprawy</T>
                <Chips
                  options={["Nowe", "W trakcie sprawdzania", "Rozwiązane"]}
                  value={status}
                  onChange={setStatus}
                />
                <Button onPress={save}>Zapisz status</Button>
                <Button
                  secondary
                  onPress={() =>
                    dialog({
                      title: "Zaktualizuj dane sprawy",
                      body: "Wpisz zweryfikowane informacje o punkcie lub zgłoszeniu.",
                      placeholder: "Informacje po weryfikacji",
                      initialValue: selected.note,
                      multiline: true,
                      confirm: "Zapisz dane",
                      onConfirm: (note) => {
                        update((s) => ({
                          ...s,
                          reports: s.reports.map((r) =>
                            r.id === selected.id ? { ...r, note } : r,
                          ),
                        }));
                        notify("Dane sprawy zaktualizowane.");
                      },
                    })
                  }
                >
                  Zaktualizuj dane punktu
                </Button>
                <T muted size={12}>
                  Zapis w demo nie potwierdza sprawności urządzenia. Decyzja
                  wymaga uzasadnienia i zapisu w historii.
                </T>
              </Card>
            )}
          </View>
        </Row>
      </Col>
    </Shell>
  );
}
