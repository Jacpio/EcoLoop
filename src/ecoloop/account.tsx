import React, { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { CollectionCard, OfferCard, Timeline } from "./blocks";
import { formatPhone, normalizePhone, vocative } from "./domain";
import { useEco } from "./store";
import {
  Badge,
  Brand,
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
  Note,
  Row,
  Shell,
  T,
  useDesktop,
} from "./ui";

export function AuthScreen({ register = false }: { register?: boolean }) {
  const { update, dialog } = useEco();
  const desktop = useDesktop();
  const [email, setEmail] = useState("anna.kowalska@example.pl");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Oddaję opakowania");
  const [agreed, setAgreed] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const login = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Podaj poprawny adres e-mail.");
      return;
    }
    if (password.length < 8) {
      setError("Wpisz przykładowe hasło o długości co najmniej 8 znaków.");
      return;
    }
    if (register && !agreed) {
      setError("Zaakceptuj regulamin i zasady prywatności.");
      return;
    }
    update((s) => ({
      ...s,
      user: {
        name: "Anna Kowalska",
        role: role === "Zbieram" ? "Zbieram" : "Oddaję",
      },
      onboarded: true,
    }));
    go(desktop ? "profile" : "home");
  };
  const demo = () => {
    update((s) => ({
      ...s,
      user: { name: "Anna Kowalska", role: "Oddaję" },
      onboarded: true,
    }));
    go(desktop ? "profile" : "home");
  };
  return (
    <Shell
      tab={false}
      title={
        desktop ? undefined : register ? "Dobrze Cię widzieć" : "Zaloguj się"
      }
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 430,
          alignSelf: "center",
          padding: desktop ? 30 : 0,
          borderWidth: desktop ? 1 : 0,
          backgroundColor: desktop ? C.paper : C.bg,
          marginTop: desktop ? 55 : 0,
        }}
      >
        {desktop && <Brand />}
        <Chips
          options={["Rejestracja", "Logowanie"]}
          value={register ? "Rejestracja" : "Logowanie"}
          onChange={(v) => go(v === "Rejestracja" ? "register" : "login")}
        />
        <T bold size={25}>
          {register ? "Dołącz do dobrego obiegu." : "Wróć do swojego obiegu."}
        </T>
        <T size={13} muted>
          Wersja demonstracyjna. Użyj przykładowych danych.
        </T>
        <Input
          label="Adres e-mail"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <View>
          <Input
            label="Hasło (minimum 8 znaków)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            autoComplete="off"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={show ? "Ukryj hasło" : "Pokaż hasło"}
            onPress={() => setShow(!show)}
            style={{ position: "absolute", right: 14, bottom: 17 }}
          >
            <Icon name="eye" size={18} />
          </Pressable>
        </View>
        {register ? (
          <>
            <T bold size={14}>
              Od czego chcesz zacząć?
            </T>
            <Chips
              options={["Oddaję opakowania", "Zbieram"]}
              value={role}
              onChange={setRole}
            />
            <T size={12} muted>
              Rolę możesz zmienić w każdej chwili.
            </T>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              onPress={() => setAgreed(!agreed)}
            >
              <Row style={{ gap: 8, alignItems: "center" }}>
                <View
                  style={{
                    height: 19,
                    width: 19,
                    borderRadius: 4,
                    backgroundColor: agreed ? C.brand : C.paper,
                    borderWidth: 1,
                    borderColor: C.line,
                  }}
                >
                  {agreed && <Icon name="check" color={C.paper} size={17} />}
                </View>
                <T muted size={12} style={{ flex: 1 }}>
                  Akceptuję regulamin i zasady prywatności.
                </T>
              </Row>
            </Pressable>
          </>
        ) : (
          <Button
            ghost
            small
            style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
            onPress={() =>
              dialog({
                title: "Odzyskiwanie hasła",
                body: "To lokalny profil demonstracyjny. Nie przechowujemy hasła i nie wysyłamy e-maili. Możesz wejść przez „Kontynuuj w demo”.",
              })
            }
          >
            Nie pamiętam hasła
          </Button>
        )}
        {!!error && (
          <T color={C.brand} size={14} accessibilityRole="alert">
            {error}
          </T>
        )}
        <Button onPress={login}>
          {register ? "Utwórz konto demo" : "Zaloguj się"}
        </Button>
        <Button
          secondary
          onPress={() =>
            dialog({
              title: "Google · wersja demonstracyjna",
              body: "Logowanie zewnętrzne nie jest podłączone. Możesz kontynuować na lokalnym profilu demo.",
              confirm: "Kontynuuj w demo",
              onConfirm: demo,
            })
          }
        >
          G · Kontynuuj z Google
        </Button>
        <Note>
          Nie ma rzeczywistych kont i logowania. Nie podawaj prawdziwego hasła.
        </Note>
        <Button
          secondary
          onPress={() => {
            update((s) => ({ ...s, onboarded: true }));
            go("map");
          }}
        >
          Przeglądaj mapę bez konta
        </Button>
        <Button ghost onPress={demo}>
          Kontynuuj w demo
        </Button>
      </Card>
    </Shell>
  );
}
export function ProfileScreen() {
  const desktop = useDesktop();
  const { state, update, dialog } = useEco();
  const active = state.collections.filter((c) =>
    ["Przyjęty", "Odebrany"].includes(c.status),
  );
  const nearest = active[0];
  const profile = (
    <Card>
      <Row style={{ alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: C.wash,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <T bold>AK</T>
        </View>
        <Col style={{ gap: 2 }}>
          <T bold>{state.user?.name || "Anna Kowalska · demo"}</T>
          <T size={12} muted>
            4,9 · 12 opinii
          </T>
        </Col>
      </Row>
      <Chips
        options={["Oddaję", "Zbieram"]}
        value={state.user?.role || "Oddaję"}
        onChange={(role) =>
          update((s) => ({
            ...s,
            user: { name: s.user?.name || "Anna Kowalska", role },
          }))
        }
      />
      <T muted size={12}>
        Przełączaj rolę bez zmiany drugiego konta.
      </T>
    </Card>
  );
  return (
    <Shell
      title="Profil i bezpieczeństwo"
      sidebar={desktop ? "profile" : undefined}
    >
      {desktop && (
        <Heading
          eyebrow="TWOJE KONTO"
          title={`Cześć, ${vocative(state.user?.name.split(" ")[0] || "Anna")}. Dobry dzień na dobry obieg.`}
          subtitle="Zarządzaj odbiorami i zobacz, co dzieje się w Twojej okolicy."
          action={
            <Button icon="plus" onPress={() => go("create")}>
              Zleć odbiór
            </Button>
          }
        />
      )}
      <Col>
        {!state.user && (
          <Note>
            Oglądasz dane przykładowe. Wybierz konto demo, aby korzystać z
            odbiorów.
          </Note>
        )}
        {desktop ? (
          <>
            <Row>
              <Stat
                label="Aktywne odbiory"
                value={String(active.length)}
                text={
                  nearest
                    ? `Najbliższy: ${nearest.time} · ${nearest.id}`
                    : "Przyjmij swój pierwszy odbiór"
                }
                accent
              />
              <Stat
                label="Oddane opakowania"
                value={String(
                  state.collections
                    .filter((c) => c.status === "Zakończony")
                    .reduce((n, c) => n + (c.returned ?? c.quantity), 0),
                )}
                text="Historia demonstracyjna"
              />
              <Stat
                label="EcoPoints · koncepcja"
                value={state.ecoPoints.toLocaleString("pl-PL")}
                text="750 pkt do poziomu 2 000 · przykład"
              />
            </Row>
            <Row style={{ gap: 24 }}>
              <Col style={{ flex: 2 }}>
                <T bold size={20}>
                  Twój najbliższy odbiór
                </T>
                {nearest ? (
                  <Card>
                    <Row style={{ justifyContent: "space-between" }}>
                      <T bold>
                        {nearest.id} · {nearest.quantity} {nearest.material}
                      </T>
                      <Badge green>{nearest.status}</Badge>
                    </Row>
                    <Timeline collection={nearest} />
                    <Button
                      secondary
                      onPress={() => go("collection", { id: nearest.id })}
                    >
                      Szczegóły / PIN
                    </Button>
                  </Card>
                ) : (
                  <Empty
                    title="Czas na dobry obieg"
                    text="Zacznij od odbioru w Twojej okolicy."
                    action="Przeglądaj odbiory"
                    onPress={() => go("collect")}
                  />
                )}
                <T bold size={20}>
                  Ostatnia historia
                </T>
                {state.collections
                  .filter((c) => c.status === "Zakończony")
                  .slice(-2)
                  .map((c) => (
                    <CollectionCard key={c.id} collection={c} />
                  ))}
                <Button secondary onPress={() => go("history")}>
                  Zobacz całą historię
                </Button>
              </Col>
              <Col style={{ flex: 1 }}>
                <T bold size={20}>
                  Polecane w okolicy
                </T>
                {state.offers.slice(1, 2).map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
                {profile}
                <Card wash>
                  <T bold>Optymalizacja tras · WKRÓTCE</T>
                  <T muted size={14}>
                    Automatyczna optymalizacja — kolejny etap. W MVP korzystasz
                    z listy odbiorów i zewnętrznej nawigacji.
                  </T>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          profile
        )}
        <View style={{ maxWidth: desktop ? 700 : undefined, gap: 0 }}>
          {[
            [
              "bell",
              "Powiadomienia",
              "notifications",
              state.notifications ? "Włączone" : "Wyłączone",
            ],
            [
              "pin",
              "Okolica i preferencje",
              "preferences",
              state.preferences.area.replace("Warszawa, ", ""),
            ],
            ["shield", "Prywatność i dane", "safety", ""],
            ["flag", "Zgłoś nadużycie", "abuse", ""],
            ["info", "Pomoc i zasady", "help", ""],
          ].map(([icon, label, screen, value]) => (
            <Pressable
              accessibilityRole="button"
              key={label}
              onPress={() => go(screen)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: C.line,
                backgroundColor: C.paper,
                borderRadius: 9,
                marginBottom: 8,
              }}
            >
              <Icon name={icon} size={18} />
              <T size={15} style={{ flex: 1 }}>
                {label}
              </T>
              <T muted size={12}>
                {value}
              </T>
              <Icon name="chevron" size={15} />
            </Pressable>
          ))}
        </View>
        <Note>
          Twój dokładny adres udostępniamy wyłącznie osobie, która przyjęła
          odbiór.
        </Note>
        <Button
          secondary
          onPress={() => {
            if (!state.user) go("login");
            else
              dialog({
                title: "Wylogować z demo?",
                body: "Twoje lokalne ogłoszenia i odbiory pozostaną zapisane na tym urządzeniu.",
                confirm: "Wyloguj się",
                onConfirm: () => {
                  update((s) => ({ ...s, user: null }));
                  go("login");
                },
              });
          }}
        >
          {state.user ? "Wyloguj się" : "Zaloguj się w demo"}
        </Button>
        <Row style={{ flexWrap: "wrap", justifyContent: "center" }}>
          <Button ghost small onPress={() => go("partner")}>
            Panel partnera
          </Button>
          <Button ghost small onPress={() => go("admin")}>
            Panel administratora
          </Button>
          <Button ghost small onPress={() => go("rewards")}>
            EcoPoints i nagrody →
          </Button>
        </Row>
      </Col>
    </Shell>
  );
}
export function Stat({
  label,
  value,
  text,
  accent,
}: {
  label: string;
  value: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <Card
      style={{
        flex: 1,
        backgroundColor: accent ? C.brand : C.paper,
        padding: 20,
      }}
    >
      <T size={13} color={accent ? C.pink : C.muted}>
        {label}
      </T>
      <T size={34} bold color={accent ? C.paper : C.ink}>
        {value}
      </T>
      <T size={12} color={accent ? C.pink : C.muted}>
        {text}
      </T>
    </Card>
  );
}
export function UtilityScreen({ screen }: { screen: string }) {
  const { state, update, dialog, notify, reset, requireUser } = useEco();
  const desktop = useDesktop();
  const [area, setArea] = useState(state.preferences.area);
  const [radius, setRadius] = useState(state.preferences.radius);
  const [phone, setPhone] = useState(formatPhone(state.user?.phone ?? ""));
  const [phoneError, setPhoneError] = useState("");
  const [text, setText] = useState("");
  const title =
    (
      {
        notifications: "Powiadomienia",
        preferences: "Okolica i preferencje",
        safety: "Prywatność i bezpieczeństwo",
        help: "Pomoc i zasady",
        abuse: "Zgłoś nadużycie",
        history: "Historia odbiorów",
        rewards: "EcoPoints i nagrody",
      } as Record<string, string>
    )[screen] || "Informacje";
  return (
    <Shell title={title} sidebar={desktop ? "profile" : undefined}>
      {desktop && <Heading title={title} />}
      <Col style={{ width: "100%", maxWidth: 750 }}>
        {screen === "notifications" && (
          <>
            <Card>
              <Row
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Col style={{ flex: 1 }}>
                  <T bold>Powiadomienia o odbiorach</T>
                  <T muted size={14}>
                    Preferencja demonstracyjna zapisana na urządzeniu.
                  </T>
                </Col>
                <Switch
                  accessibilityLabel="Powiadomienia o odbiorach"
                  value={state.notifications}
                  onValueChange={(notifications) =>
                    update((s) => ({ ...s, notifications }))
                  }
                  trackColor={{ false: C.line, true: C.brand }}
                />
              </Row>
            </Card>
            <Note>
              W MVP nie wysyłamy powiadomień push. Statusy sprawdzisz w Moich
              odbiorach.
            </Note>
          </>
        )}
        {screen === "preferences" && (
          <>
            <Input
              label="Twoja okolica"
              value={area}
              onChangeText={setArea}
              icon="pin"
            />
            <T bold>Promień poszukiwań</T>
            <Chips
              options={["1 km", "3 km", "5 km"]}
              value={radius}
              onChange={setRadius}
            />
            <Button
              onPress={() => {
                if (!area.trim()) return;
                update((s) => ({
                  ...s,
                  preferences: { area: area.trim(), radius },
                }));
                notify("Preferencje zapisane.");
              }}
            >
              Zapisz preferencje
            </Button>
            <Input
              label="Numer telefonu do BLIK"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={phone}
              onChangeText={setPhone}
              placeholder="+48 600 100 200"
            />
            <Note>
              Numer służy do odbioru kaucji przelewem z kaucjomatu oraz do
              rozliczeń BLIK z sąsiadami. Pokazujemy go tylko osobom, którym
              sam go udostępnisz w ogłoszeniu. Wersja demo nie wykonuje
              płatności.
            </Note>
            {!!phoneError && (
              <T color={C.brand} accessibilityRole="alert">
                {phoneError}
              </T>
            )}
            <Button
              secondary
              onPress={() => {
                const digits = phone.trim() ? normalizePhone(phone) : "";
                if (digits === null) {
                  setPhoneError(
                    "Podaj numer w formacie 9 cyfr, np. 600 100 200.",
                  );
                  return;
                }
                setPhoneError("");
                requireUser(() => {
                  update((s) => ({
                    ...s,
                    user: s.user && {
                      name: s.user.name,
                      role: s.user.role,
                      ...(digits && { phone: digits }),
                    },
                  }));
                  setPhone(formatPhone(digits));
                  notify(
                    digits
                      ? "Numer telefonu zapisany."
                      : "Numer telefonu usunięty.",
                  );
                });
              }}
            >
              Zapisz numer telefonu
            </Button>
          </>
        )}
        {screen === "safety" && (
          <>
            <Card>
              <Icon name="lock" color={C.brand} />
              <T bold size={22}>
                Twój adres zostaje prywatny
              </T>
              <T>
                W publicznym ogłoszeniu pokazujemy tylko okolicę. Dokładny adres
                zobaczy przyjęty zbierający.
              </T>
            </Card>
            <Card>
              <Icon name="shield" color={C.brand} />
              <T bold size={22}>
                PIN przy przekazaniu
              </T>
              <T>
                Podaj kod dopiero, gdy opakowania zostały przekazane. PIN nie
                jest potwierdzeniem zwrotu kaucji w automacie.
              </T>
            </Card>
            <Card>
              <T bold size={22}>
                Dane lokalnej wersji demo
              </T>
              <T>
                Profil, ogłoszenia, odbiory i zgłoszenia zapisujemy na tym
                urządzeniu. Hasło nie jest przechowywane ani przesyłane. Nie ma
                prawdziwych płatności.
              </T>
            </Card>
            <Button
              secondary
              onPress={() =>
                dialog({
                  title: "Usunąć dane demonstracyjne?",
                  body: "Usuniemy Twoje odbiory, ogłoszenia i lokalny profil z tej aplikacji.",
                  confirm: "Usuń moje dane demo",
                  onConfirm: () => {
                    reset();
                    notify("Lokalne dane profilu i odbiorów zostały usunięte.");
                    go();
                  },
                })
              }
            >
              Usuń moje dane demo
            </Button>
          </>
        )}
        {screen === "help" && (
          <>
            <Heading
              title="Dobry obieg, jasne zasady."
              subtitle="EcoLoop łączy punkty zwrotu z sąsiedzkimi odbiorami opakowań."
            />
            {[
              [
                "Jak oddać opakowania?",
                "Dodaj ogłoszenie, podaj rodzaj i ilość, udział zbierającego oraz dogodny termin. Po akceptacji uzgodnij adres prywatnie.",
              ],
              [
                "Jak działa kaucja?",
                "Kwoty są szacunkowe: PET i puszki 0,50 zł, szkło 1 zł. Liczą się opakowania ze znakiem kaucji. W MVP rozliczenia są symulowane.",
              ],
              [
                "Co z elektroniką?",
                "Sprawny sprzęt może trafić do darowizny. Elektroodpady przekazuj wyłącznie uprawnionym odbiorcom przez EcoElectro.",
              ],
              [
                "Co zrobić, gdy ktoś nie przyjdzie?",
                "Otwórz odbiór i wybierz Nieobecność. Napisz do drugiej osoby, zaproponuj termin lub anuluj odbiór.",
              ],
            ].map(([q, a]) => (
              <Card key={q}>
                <T bold size={19}>
                  {q}
                </T>
                <T muted>{a}</T>
              </Card>
            ))}
            <Button secondary onPress={() => go("abuse")}>
              Zgłoś problem lub nadużycie
            </Button>
          </>
        )}
        {screen === "abuse" && (
          <>
            <Input
              label="Opisz problem"
              multiline
              placeholder="Numer odbioru, punkt lub opis sytuacji"
              value={text}
              onChangeText={setText}
            />
            <Button
              disabled={!text.trim()}
              onPress={() => {
                update((s) => ({
                  ...s,
                  reports: [
                    {
                      id: "Z-" + Date.now().toString().slice(-5),
                      title: "Zgłoszenie nadużycia",
                      target: state.user?.name || "Gość",
                      priority: "Normalny",
                      status: "Nowe",
                      note: text,
                    },
                    ...s.reports,
                  ],
                }));
                setText("");
                notify(
                  "Zgłoszenie zapisane w demonstracyjnym panelu administratora.",
                );
              }}
            >
              Wyślij zgłoszenie
            </Button>
            <Note>
              Nie podawaj w zgłoszeniu haseł ani wrażliwych danych. Dane
              pozostają lokalnie.
            </Note>
          </>
        )}
        {screen === "history" && (
          <>
            {state.collections
              .filter((c) => ["Zakończony", "Anulowany"].includes(c.status))
              .map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            {!state.collections.some((c) =>
              ["Zakończony", "Anulowany"].includes(c.status),
            ) && (
              <Empty
                title="Historia dopiero się zaczyna"
                text="Zakończone i anulowane odbiory pojawią się w tym miejscu."
                action="Moje odbiory"
                onPress={() => go("orders")}
              />
            )}
          </>
        )}
        {screen === "rewards" && (
          <>
            <Badge>KOLEJNY ETAP · KONCEPCJA</Badge>
            <Card>
              <T muted>Twoje EcoPoints · saldo przykładowe</T>
              <T bold size={46}>
                {state.ecoPoints.toLocaleString("pl-PL")}
              </T>
              <View
                style={{ height: 6, borderRadius: 3, backgroundColor: C.wash }}
              >
                <View
                  style={{
                    height: 6,
                    width: "62.5%",
                    backgroundColor: C.brand,
                    borderRadius: 3,
                  }}
                />
              </View>
              <T muted size={13}>
                750 pkt do kolejnego poziomu · cel 2 000
              </T>
            </Card>
            <Card>
              <Row>
                <Icon name="coffee" color={C.brand} />
                <T bold>Kawa na własny kubek</T>
              </Row>
              <T muted>800 pkt · przykładowa nagroda lokalnego partnera.</T>
              <Button
                secondary
                onPress={() =>
                  dialog({
                    title: "Nagrody są w planach",
                    body: "Program EcoPoints nie jest aktywny w MVP. Nie pobraliśmy punktów. Ten ekran przedstawia planowaną funkcję.",
                  })
                }
              >
                Zobacz nagrodę demo
              </Button>
            </Card>
            <Note>
              Punkty, misje i nagrody są koncepcją kolejnego etapu. Nie można
              ich kupić ani wymienić.
            </Note>
          </>
        )}
        <Button ghost onPress={() => go("profile")}>
          ← Wróć do profilu
        </Button>
      </Col>
    </Shell>
  );
}
