import { Onboarding } from "./onboarding";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useEco } from "./store";
import {
  Badge,
  Brand,
  Button,
  C,
  Card,
  Col,
  go,
  Heading,
  Icon,
  LineDivider,
  MapCanvas,
  photos,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";
import { OfferCard, PointCard } from "./blocks";

export { Onboarding } from "./onboarding";

export function Home() {
  const desktop = useDesktop();
  const { state, ready } = useEco();
  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={C.brand} />
      </View>
    );
  if (!desktop && !state.onboarded) return <Onboarding />;
  return desktop ? <Landing /> : <MobileHome />;
}
function MobileHome() {
  const { state } = useEco();
  return (
    <Shell title={`Cześć, ${state.user?.name.split(" ")[0] || "Anno"}!`}>
      <Col>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Zmień okolicę"
          onPress={() => go("preferences")}
        >
          <Row style={{ alignItems: "center" }}>
            <Icon name="pin" size={15} />
            <T size={13} muted>
              {state.preferences.area} · zmień okolicę
            </T>
          </Row>
        </Pressable>
        <Row>
          <Button
            style={{ flex: 1.3, paddingHorizontal: 12 }}
            icon="pin"
            onPress={() => go("map")}
          >
            Znajdź kaucjomat
          </Button>
          <Button
            secondary
            style={{ flex: 1, paddingHorizontal: 12 }}
            icon="plus"
            onPress={() => go("create")}
          >
            Zleć odbiór
          </Button>
        </Row>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <T bold size={18}>
            Najbliższy punkt
          </T>
          <Button small ghost onPress={() => go("map")}>
            Mapa →
          </Button>
        </Row>
        <PointCard id="market" />
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <T bold size={18}>
            Po sąsiedzku
          </T>
          <Button small ghost onPress={() => go("collect")}>
            Wszystkie →
          </Button>
        </Row>
        {state.offers.slice(0, 1).map((offer) => (
          <Pressable key={offer.id} onPress={() => go("collect")}>
            <OfferCard offer={offer} compact />
          </Pressable>
        ))}
        <T muted size={12}>
          Kwoty szacunkowe · rozliczenia w demo są symulowane.
        </T>
        <Card style={{ backgroundColor: C.electroBg }}>
          <Row>
            <Icon name="plug" color={C.electro} />
            <T bold size={18}>
              Elektronika w dobrych rękach.
            </T>
          </Row>
          <T muted size={14}>
            Sprawny sprzęt podaj dalej. Elektroodpady przekaż uprawnionemu
            odbiorcy.
          </T>
          <Button secondary onPress={() => go("electro")}>
            Poznaj EcoElectro
          </Button>
        </Card>
      </Col>
    </Shell>
  );
}
function Landing() {
  const [faq, setFaq] = useState<number | null>(null);
  const faqs = [
    [
      "Czy EcoLoop wypłaca pieniądze?",
      "W wersji demonstracyjnej kwoty są szacunkowe, a rozliczenia symulowane. Nie potwierdzamy rzeczywistych zwrotów.",
    ],
    [
      "Kto ustala udział w kaucji?",
      "Osoba dodająca ogłoszenie. Zbierający zna udział i szacowaną kwotę przed przyjęciem odbioru.",
    ],
    [
      "Czy mogę oddać niedziałający laptop?",
      "Tak, przez EcoElectro — wyłącznie uprawnionemu odbiorcy. Sprawne urządzenia mają osobną ścieżkę darowizny.",
    ],
  ];
  return (
    <Shell bare>
      <View>
        <View style={l.landingInner}>
          <Row
            style={{
              gap: 64,
              alignItems: "center",
              paddingTop: 62,
              paddingBottom: 60,
            }}
          >
            <Col style={{ flex: 1, gap: 24 }}>
              <Badge>DOBRY OBIEG ZACZYNA SIĘ BLISKO</Badge>
              <T bold size={58} style={{ letterSpacing: -1.5, lineHeight: 61 }}>
                Oddawaj wygodniej.{"\n"}Zbieraj mądrzej.
              </T>
              <T muted size={19}>
                Butelki, puszki i dobry plan. Znajdź punkt zwrotu albo umów
                sąsiedzki odbiór i podziel się kaucją.
              </T>
              <Row>
                <Button icon="pin" onPress={() => go("map")}>
                  Znajdź kaucjomat
                </Button>
                <Button secondary onPress={() => go("create")}>
                  Zleć odbiór
                </Button>
              </Row>
              <Row style={{ alignItems: "center" }}>
                <Icon name="shield" size={18} />
                <T muted size={13}>
                  Jasny podział kaucji. Prywatny adres. Ty decydujesz.
                </T>
              </Row>
            </Col>
            <Image
              source={photos.hero}
              resizeMode="cover"
              style={{
                width: "44%",
                height: "auto",
                aspectRatio: 568 / 448,
                flexShrink: 0,
                borderRadius: 18,
              }}
            />
          </Row>
          <Row style={{ gap: 22, paddingBottom: 60 }}>
            {[
              [
                "pin",
                "Bliżej do zwrotu",
                "Punkty, godziny i rodzaje opakowań na czytelnej mapie. Bez logowania.",
              ],
              [
                "hand",
                "Wygodniej po sąsiedzku",
                "Umów odbiór i z góry ustal udział w kaucji. Adres prywatny do momentu przyjęcia.",
              ],
              [
                "flag",
                "Bezpieczne przekazanie",
                "Dokładny adres widoczny dopiero po przyjęciu odbioru. Przekazanie potwierdzasz PIN-em.",
              ],
            ].map(([icon, title, body]) => (
              <Card key={title} style={{ flex: 1, padding: 24 }}>
                <Icon name={icon} color={C.brand} size={25} />
                <T size={22}>{title}</T>
                <T muted size={16}>
                  {body}
                </T>
              </Card>
            ))}
          </Row>
        </View>
        <Section wash>
          <Heading
            eyebrow="01 / TWOJA OKOLICA"
            title="Nie szukaj w ciemno. Sprawdź na mapie."
            subtitle="Kaucjomaty i ręczny zwrot opakowań — z godzinami i oznaczeniami. Punkty elektroniki znajdziesz w osobnym widoku EcoElectro."
          />
          <Row style={{ gap: 24 }}>
            <View style={{ flex: 2 }}>
              <MapCanvas height={300} />
            </View>
            <Col style={{ flex: 1 }}>
              <PointCard id="market" />
              <T muted size={12}>
                Warszawa, Centrum. Dane demonstracyjne. Dostępność nie jest
                statusem na żywo — sprawdź przed wyjściem.
              </T>
              <Button secondary icon="navigate" onPress={() => go("map")}>
                Otwórz mapę
              </Button>
            </Col>
          </Row>
        </Section>
        <Section>
          <Heading
            eyebrow="02 / PROSTY PLAN"
            title="Od pełnej torby do pustego kąta."
          />
          <Row style={{ marginBottom: 45, gap: 35 }}>
            {[
              [
                "01",
                "Wybierz sposób",
                "Znajdź punkt lub dodaj ogłoszenie. Podaj rodzaj i liczbę opakowań.",
              ],
              [
                "02",
                "Ustal szczegóły",
                "Wybierz termin oraz udział w kaucji. Dokładny adres zostaje prywatny.",
              ],
              [
                "03",
                "Przekaż i podsumuj",
                "Potwierdź przekazanie PIN-em. Zwrot i rozliczenie to osobny etap.",
              ],
            ].map(([n, title, body]) => (
              <Col
                key={n}
                style={{
                  flex: 1,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderColor: C.line,
                }}
              >
                <T bold size={30} color={C.brand}>
                  {n}
                </T>
                <T size={18}>{title}</T>
                <T muted size={14}>
                  {body}
                </T>
              </Col>
            ))}
          </Row>
          <Row style={{ gap: 24 }}>
            <Card style={{ flex: 1, padding: 28 }}>
              <T muted size={11}>
                ODDAJĘ
              </T>
              <T bold size={26}>
                Odzyskaj miejsce, nie trać czasu.
              </T>
              <T muted>
                Dodaj 40 PET, ustal 50% udziału dla zbierającego i wybierz
                dogodny termin. Zbierający widzi tylko przybliżoną okolicę.
              </T>
              <Button
                style={{ alignSelf: "flex-start" }}
                onPress={() => go("create")}
              >
                Oddaj opakowania
              </Button>
            </Card>
            <Card wash style={{ flex: 1, padding: 28 }}>
              <T muted size={11}>
                ZBIERAM
              </T>
              <T bold size={26}>
                Zamień spacer w sensowną trasę.
              </T>
              <T muted>
                Wybieraj pobliskie odbiory, porównuj szacowany udział i łącz
                przystanki w EcoRoute. Trasę planuj przed przyjęciem.
              </T>
              <Button
                secondary
                style={{ alignSelf: "flex-start" }}
                onPress={() => go("collect")}
              >
                Przeglądaj odbiory
              </Button>
            </Card>
          </Row>
        </Section>
        <Section wash>
          <Row style={{ gap: 48, alignItems: "center" }}>
            <Image
              source={photos.electronics}
              style={{
                width: "36%",
                height: "auto",
                aspectRatio: 1.6,
                borderRadius: 14,
              }}
            />
            <Col style={{ flex: 1 }}>
              <Heading
                eyebrow="03 / ECOELECTRO"
                title="Sprawny sprzęt dalej. Elektroodpad do specjalisty."
                subtitle="Działające urządzenia możesz oddać sąsiadowi. Niesprawny laptop przekazujesz uprawnionemu odbiorcy — nigdy do otwartej giełdy zbierających."
              />
              <Row>
                <Button onPress={() => go("electro")}>Oddaj elektronikę</Button>
                <Button
                  secondary
                  onPress={() => go("map", { category: "electronics" })}
                >
                  Znajdź punkt
                </Button>
              </Row>
            </Col>
          </Row>
        </Section>
        <Section>
          <Row style={{ alignItems: "center", gap: 70 }}>
            <Col style={{ flex: 2 }}>
              <Heading
                eyebrow="04 / NAWYKI, KTÓRE ZOSTAJĄ · KOLEJNY ETAP"
                title="Małe kroki. Punkty na koncie."
                subtitle="EcoPoints i nagrody lokalnych partnerów — planowane w kolejnym etapie. Saldo, misje i nagrody są przykładami; program nie działa jeszcze w MVP."
              />
              <Button
                secondary
                style={{ alignSelf: "flex-start" }}
                onPress={() => go("rewards")}
              >
                Nagrody · wkrótce
              </Button>
            </Col>
            <Card style={{ flex: 1 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T size={34} bold>
                  1 250
                </T>
                <Badge>EcoPoints</Badge>
              </Row>
              <View
                style={{ height: 5, backgroundColor: C.wash, borderRadius: 4 }}
              >
                <View
                  style={{
                    width: "62.5%",
                    backgroundColor: C.brand,
                    height: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
              <T muted size={12}>
                750 pkt do kolejnego poziomu · cel 2 000
              </T>
              <LineDivider />
              <Row>
                <Icon name="coffee" color={C.brand} />
                <Col style={{ gap: 0 }}>
                  <T bold size={15}>
                    Kawa na własny kubek
                  </T>
                  <T muted size={12}>
                    800 pkt · przykład nagrody demo
                  </T>
                </Col>
              </Row>
            </Card>
          </Row>
          <View style={{ marginTop: 50 }}>
            <Heading
              eyebrow="05 / ZAUFANIE MA ZNACZENIE"
              title="Jasne zasady, bez niespodzianek."
            />
            <Row>
              {[
                [
                  "lock",
                  "Prywatność adresu",
                  "Dokładny adres dopiero po przyjęciu odbioru.",
                ],
                [
                  "shield",
                  "PIN przy przekazaniu",
                  "Kod dotyczy przekazania, nie potwierdza zwrotu w automacie.",
                ],
                [
                  "flag",
                  "Oceny i zgłoszenia",
                  "Zgłoś problem z punktem lub nadużycie użytkownika.",
                ],
              ].map(([icon, title, body]) => (
                <Card key={title} style={{ flex: 1 }}>
                  <Icon name={icon} color={C.brand} />
                  <T bold>{title}</T>
                  <T size={13} muted>
                    {body}
                  </T>
                </Card>
              ))}
            </Row>
          </View>
        </Section>
        <Section wash>
          <Row style={{ gap: 70 }}>
            <View style={{ flex: 1 }}>
              <Heading
                eyebrow="06 / WARTO WIEDZIEĆ"
                title="Masz pytania? Zacznij tutaj."
              />
            </View>
            <Col style={{ flex: 2 }}>
              {faqs.map(([question, answer], i) => (
                <Pressable
                  key={question}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: faq === i }}
                  onPress={() => setFaq(faq === i ? null : i)}
                  style={{
                    borderBottomWidth: 1,
                    borderColor: C.line,
                    paddingBottom: 14,
                  }}
                >
                  <Row style={{ justifyContent: "space-between" }}>
                    <T bold>{question}</T>
                    <Icon name={faq === i ? "down" : "chevron"} size={17} />
                  </Row>
                  <T size={14} muted style={{ marginTop: 8 }}>
                    {answer}
                  </T>
                  {faq === i && (
                    <T size={14} color={C.brand} style={{ marginTop: 8 }}>
                      Wszystkie ścieżki możesz sprawdzić w wersji
                      demonstracyjnej.
                    </T>
                  )}
                </Pressable>
              ))}
            </Col>
          </Row>
        </Section>
        <Section>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Col>
              <T bold size={32}>
                Dobry obieg jest bliżej, niż myślisz.
              </T>
              <T muted>Zacznij od swojej okolicy. Jedna torba wystarczy.</T>
            </Col>
            <Button icon="arrow" onPress={() => go("register")}>
              Rozpocznij z EcoLoop
            </Button>
          </Row>
        </Section>
        <View style={{ backgroundColor: C.wash }}>
          <View style={[l.landingInner, { paddingVertical: 32, gap: 22 }]}>
            <Row style={{ alignItems: "center" }}>
              <Brand />
              <View style={{ flex: 1 }} />
              {[
                ["O EcoLoop", "help"],
                ["Pomoc", "help"],
                ["Regulamin", "safety"],
                ["Prywatność", "safety"],
                ["Dla partnerów", "partner"],
                ["Administracja", "admin"],
              ].map(([label, screen]) => (
                <Button key={label} ghost small onPress={() => go(screen)}>
                  {label}
                </Button>
              ))}
            </Row>
            <LineDivider />
            <T size={11} muted>
              © 2026 EcoLoop · Projekt demonstracyjny · dane przykładowe / brak
              rzeczywistych płatności. Mapa OpenStreetMap · punkty przykładowe,
              bez weryfikacji dostępności na żywo.
            </T>
          </View>
        </View>
      </View>
    </Shell>
  );
}
function Section({
  children,
  wash = false,
}: {
  children: React.ReactNode;
  wash?: boolean;
}) {
  return (
    <View style={{ backgroundColor: wash ? C.wash : C.bg }}>
      <View style={[l.landingInner, { paddingVertical: 50 }]}>{children}</View>
    </View>
  );
}
const l = StyleSheet.create({
  landingInner: {
    width: "100%",
    maxWidth: 1440,
    paddingHorizontal: 60,
    alignSelf: "center",
  },
  onboarding: {
    padding: 22,
    paddingTop: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
});
