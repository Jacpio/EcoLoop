import React, { useState } from "react";
import { Image } from "react-native";
import { supportsArea } from "./domain";
import { useEco } from "./store";
import {
  Badge,
  Button,
  C,
  Card,
  Chips,
  Col,
  go,
  Heading,
  Icon,
  Input,
  Note,
  photos,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";

export function ElectroScreen() {
  const desktop = useDesktop();
  return (
    <Shell title="EcoElectro">
      {desktop && (
        <Heading
          eyebrow="03 / ECOELECTRO"
          title="Sprzęt we właściwych rękach."
          subtitle="Sprawny sprzęt podaj dalej. Elektroodpady przekazuj uprawnionym odbiorcom."
        />
      )}
      <Row style={{ flexDirection: desktop ? "row" : "column", gap: 28 }}>
        <Col style={{ flex: 1 }}>
          {desktop && (
            <Image
              source={photos.electronics}
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: 1.6,
                borderRadius: 16,
              }}
            />
          )}
          <T bold size={desktop ? 30 : 25}>
            Elektronika · bezpieczne przekazanie
          </T>
          <T muted>
            Niesprawny sprzęt oddaj do właściwego punktu lub uprawnionego
            partnera.
          </T>
          <Card wash>
            {[
              "1. Sprawdź obszar odbioru",
              "2. Opisz sprzęt i wybierz termin",
              "3. Partner potwierdzi warunki",
            ].map((item) => (
              <T key={item} bold size={16}>
                {item}
              </T>
            ))}
          </Card>
          <Button onPress={() => go("electro-form")}>
            Zgłoś do uprawnionego partnera
          </Button>
          <Button
            secondary
            onPress={() => go("map", { category: "electronics" })}
          >
            Znajdź punkt zbiórki
          </Button>
          <Note>
            Elektroodpady nie trafiają do otwartej giełdy odbiorów opakowań ani
            do zwykłego zbierającego.
          </Note>
        </Col>
        <Col style={{ flex: 1 }}>
          <Card>
            <Icon name="plug" color={C.brand} size={32} />
            <T bold size={25}>
              Podaj dalej · sprawny sprzęt
            </T>
            <T muted>
              Oddanie nadal działającego urządzenia to osobna ścieżka darowizny.
              Usuń dane i przywróć ustawienia fabryczne przed przekazaniem.
            </T>
            <Button
              secondary
              onPress={() => go("electro-form", { donation: "true" })}
            >
              Przekaż sprawny sprzęt
            </Button>
          </Card>
          <Card wash>
            <T bold size={20}>
              Zanim oddasz elektronikę
            </T>
            <T size={15}>
              Odłącz urządzenie od prądu. Usuń dane osobowe, karty SIM i
              pamięci. Nie rozbieraj urządzenia ani uszkodzonej baterii.
            </T>
            <T muted size={13}>
              Warunki odbioru potwierdza partner. Zgłoszenie nie jest
              potwierdzeniem przyjęcia.
            </T>
          </Card>
          <Button ghost onPress={() => go("partner")}>
            Panel partnera · podgląd demo →
          </Button>
        </Col>
      </Row>
    </Shell>
  );
}
export function ElectroForm({ donation = false }: { donation?: boolean }) {
  const desktop = useDesktop();
  const { state, update, dialog, notify, requireUser } = useEco();
  const [device, setDevice] = useState("Laptop");
  const [condition, setCondition] = useState(
    donation ? "Sprawny" : "Nie działa",
  );
  const [area, setArea] = useState("Częstochowa, Centrum");
  const [date, setDate] = useState("26.10.2026 · 10:00–12:00");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const check = () => {
    const supported = supportsArea(area, state.partnerArea);
    setChecked(supported);
    if (!supported) {
      setError(
        `Partner demo obsługuje: ${state.partnerArea}. Możesz znaleźć punkt na mapie.`,
      );
    } else {
      setError("");
      notify("Okolica jest w obszarze obsługi partnera demo.");
    }
  };
  const submit = () => {
    if (!checked) {
      setError("Najpierw sprawdź obszar obsługi.");
      return;
    }
    if (!date.trim()) {
      setError("Podaj proponowany termin.");
      return;
    }
    requireUser(() => {
      const item = {
        id: "EE-" + Date.now().toString().slice(-5),
        device,
        condition,
        area,
        date,
        status: donation ? "Darowizna" : "Nowe",
        note,
      };
      update((s) => ({ ...s, electronics: [item, ...s.electronics] }));
      dialog({
        title: "Zgłoszenie zapisane",
        body: `${item.id}. ${donation ? "Sprawny sprzęt zgłoszono do osobnej ścieżki darowizny." : "Zgłoszenie trafiło do demonstracyjnego panelu uprawnionego partnera."} Termin wymaga potwierdzenia.`,
        confirm: "Wróć do EcoElectro",
        onConfirm: () => go("electro"),
      });
    });
  };
  return (
    <Shell title={donation ? "Darowizna sprzętu" : "Zgłoszenie elektroniki"}>
      {desktop && (
        <Heading
          title={
            donation ? "Podaj sprawny sprzęt dalej." : "Zgłoszenie elektroniki"
          }
          subtitle="Opisz urządzenie i ustal szczegóły bezpiecznego przekazania."
        />
      )}
      <Col style={{ maxWidth: 620, width: "100%", alignSelf: "center" }}>
        <Badge>
          {donation
            ? "Sprawny sprzęt · darowizna"
            : "Elektroodpad · tylko uprawniony odbiorca"}
        </Badge>
        <T bold size={16}>
          Rodzaj sprzętu
        </T>
        <Chips
          options={["Laptop", "Monitor", "Telefon", "Drukarka"]}
          value={device}
          onChange={setDevice}
        />
        <T bold size={16}>
          Stan urządzenia
        </T>
        <Chips
          options={donation ? ["Sprawny"] : ["Nie działa", "Do oceny"]}
          value={condition}
          onChange={setCondition}
        />
        <Input
          label="Przybliżona okolica"
          icon="pin"
          value={area}
          onChangeText={(value) => {
            setArea(value);
            setChecked(false);
          }}
        />
        <Button secondary onPress={check}>
          {checked ? "✓ Obszar obsługiwany" : "Sprawdź obszar obsługi"}
        </Button>
        <T muted size={12}>
          Partner potwierdza, czy obsługuje ten adres. Nie przekazujemy sprzętu
          osobom z giełdy opakowań.
        </T>
        <Input
          label="Proponowany dzień i godziny"
          icon="calendar"
          value={date}
          onChangeText={setDate}
        />
        <Input
          label="Opis urządzenia i uwagi"
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Co warto wiedzieć przed odbiorem?"
        />
        <Note>
          {donation
            ? "Przed przekazaniem sprawdź działanie sprzętu i usuń dane osobowe."
            : "Odbiór wyłącznie przez uprawniony podmiot. Usuń dane przed oddaniem sprzętu."}
        </Note>
        {!!error && (
          <T color={C.brand} accessibilityRole="alert">
            {error}
          </T>
        )}
        <Button onPress={submit}>
          {donation
            ? "Zgłoś sprzęt do darowizny"
            : "Wyślij zgłoszenie do partnera"}
        </Button>
        <Button ghost onPress={() => go("electro")}>
          ← Wróć do EcoElectro
        </Button>
      </Col>
    </Shell>
  );
}
