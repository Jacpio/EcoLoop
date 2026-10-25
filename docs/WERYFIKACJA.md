# Weryfikacja EcoLoop

Stan: 25.10.2026. Projekt pozostaje lokalną demonstracją na podstawie obu dostarczonych PNG.

> Uwaga: poniższa sekcja „Wykonane kontrole” pochodzi z pierwszej wersji projektu. Stwierdzenie, że `npm run typecheck` przechodzi bez błędów, nie było prawdziwe (3 błędy, patrz audyt niżej). Aktualne wyniki są w sekcji „Audyt 25.10.2026”.

## Wykonane kontrole

- `npm run lint`: bez błędów i ostrzeżeń.
- `npm run typecheck`: bez błędów (nieprawda w tamtym stanie repozytorium, patrz audyt).
- `npx expo export --platform all --output-dir /tmp/ecoloop-build`: poprawny eksport web, Android i iOS.
- Kalkulator: stawki PET/puszki/szkło, korekta 40 → 36 oraz 60 wariantów ilości i procentów. Podział po zaokrągleniu sumuje się do całej kaucji z dokładnością do grosza.
- Przeglądarka: układ mobilny i desktop, trzy slajdy onboardingu, publikacja ogłoszenia w trzech krokach i zachowanie danych po odświeżeniu.
- Odbiór: przyjęcie EL-1042, odrzucenie PIN-u 0000, zaakceptowanie 7429, zakończenie po zwrocie 36 opakowań i podział 18 zł na 9 zł + 9 zł.
- Mapa: aktualizacja stanu punktu na Awaria, zapis zgłoszenia, odczyt w panelu administratora i zmiana statusu na Rozwiązane.
- Elektronika: sprawdzenie obszaru Centrum, zapis zgłoszenia, odczyt w panelu partnera i zaplanowanie odbioru.
- Zrzuty końcowego interfejsu: `previews/web.jpg`, `previews/mobile.jpg`.

Nie wykonano uruchomienia na fizycznym telefonie ani podpisanego buildu EAS. Eksport paczek nie zastępuje takiego testu. Zdjęcia, systemowy wybór pliku i zewnętrzna nawigacja wymagają dodatkowej kontroli na urządzeniu docelowym.

## Zależności narzędziowe

`npm audit --omit=dev` zgłasza 5 alertów o poziomie high w łańcuchu narzędzi Expo CLI (`node-forge`, `zod` oraz pakiety nadrzędne). Nie zastosowano sugerowanego przez npm obniżenia Expo do SDK 44, ponieważ jest niezgodne z projektem SDK 58. Przed wdrożeniem produkcyjnym należy osobno rozwiązać aktualizację tego łańcucha zależności. Nie dotyczy to dodania prawdziwego logowania, zaplecza serwerowego ani płatności — te integracje nie są częścią lokalnego demo.

## Aktualizacja: animacje i OpenStreetMap

- Samouczek: przejścia opacity/translate, przybliżenie zdjęcia i wskaźnik postępu. W przeglądarce potwierdzono wartości pośrednie animacji (opacity 0,55 i translateX 13 px), blokadę przycisku w trakcie, następny i poprzedni slajd oraz gest przesunięcia zdjęcia. Preferencja ograniczenia ruchu jest odczytywana z AccessibilityInfo; nie zmieniano ustawień systemu użytkownika podczas testu.
- Mapa: Leaflet z prawdziwymi kafelkami OpenStreetMap. W przeglądarce potwierdzono poprawnie załadowane kafelki z tile.openstreetmap.org oraz zmianę adresów z poziomu z=15 na z=16 po przybliżeniu.
- Kategorie: domyślnie tylko opakowania; elektronika w osobnym widoku i z innym symbolem/kolorem. Kliknięcie znacznika elektroniki otwiera szczegóły uprawnionego odbiorcy bez alternatywy w kaucjomacie. Powrót zachowuje kategorię.
- Testy `npm run test:map` obejmują rozdzielenie kategorii we wszystkich kombinacjach filtrów, obsługę szkła, wyszukiwanie, współrzędne i odrzucanie obcych komunikatów mostu mapy.
- Nie przyznawano podczas testów zgody na lokalizację urządzenia i nie sprawdzano GPS na fizycznym telefonie. Wariant Android/iOS korzysta z natywnego WebView; fizyczny test tego widoku pozostaje odrębnym etapem.
- Poprzedni opis mapy jako tła demonstracyjnego jest nieaktualny. Demonstracyjne pozostają punkty oraz ich dostępność, a nie mapa.

## Audyt 25.10.2026 (gałąź `review/full-project-audit`)

Przegląd całego kodu (`src/ecoloop`, trasy, mapa, stan, skrypty) oraz porównanie z ramkami z `FIGMA/` w natywnej rozdzielczości.

### Stan wyjściowy (commit `a70a620`)

- `npm run typecheck`: **3 błędy** (2× brakujące deklaracje `*.css` w nieużywanych plikach szablonu Expo, 1× `hovered` w `Button`). Dokument powyżej twierdził co innego.
- `npm run lint`: czysto. `npm run test:map`: 5/5.
- `npx expo export --platform all`: poprawny (Metro nie sprawdza typów).

### Znalezione i naprawione problemy

| Obszar | Problem | Naprawa |
| --- | --- | --- |
| Typy | `hovered` nie istnieje w typach RN | Wąskie rzutowanie (tylko web) |
| Szablon | Nieużywany kod startowy Expo i `reset-project` (kasuje `src/app`) | Usunięte |
| Stan | Odczyt zapisu sprawdzał tylko 4 tablice; złe typy pól mogły psuć ekrany | `persist.ts`, pole po polu, testy |
| Ogłoszenie | Walidacja tylko w przyciskach „Dalej”; `/create?step=3` pozwalał opublikować 0 opakowań i błędną datę | Pełna walidacja przy publikacji, zakaz dat z przeszłości |
| Ogłoszenie | Domyślna data zaszyta jako 25.10.2026 | `createDraft()` (dzisiaj) |
| Korekty | Domyślne „36” zaszyte; dla odbioru 24 puszek zapis był odrzucany | Wartość liczona z odbioru; limity korekty i odrzucenia |
| Korekty | Zakończony lub anulowany odbiór dało się edytować przez URL | Ekran „Odbiór jest już zamknięty” |
| PIN | Pole przyjmowało litery | Tylko cyfry |
| Plan | „Godzina odbioru” sortował same godziny; link do Google zawierał klatkę i mieszkanie; błąd otwarcia linku nieobsłużony | Sortowanie dzień + godzina, tylko ulica i numer, komunikat |
| Wyszukiwanie | Tylko dwa dokładne zapytania działały jak „całe miasto”; polskie znaki psuły wyszukiwanie | Normalizacja, słowa miasta/dzielnicy pomijane, reszta musi pasować |
| Dialog | Po zamknięciu przez ok. 200 ms widać było pusty biały modal | Treść zostaje na czas animacji |
| Zdjęcia | Base64 całego zdjęcia w jednym kluczu pamięci (limit ok. 5 MB web, ok. 2 MB wiersz Android) | Web: zmniejszenie do 1024 px; native: adres pliku |
| Partner | „✓ w zasięgu obsługi” zawsze zielone | Wynik `supportsArea` |
| Punkt | Nieznany `?id=` dawał pustą mapę i kartę Market Centrum | Jeden, spójny punkt |
| Mobile (Figma) | Przycisk „Znajdź kaucjomat” zawijał się; „obok zielony” zamiast „zmień okolicę”; kwota powtórzona na karcie; mapa pod dwoma ekranami filtrów | Dopasowane do ramek |
| Powitanie | „Cześć, Anna!” zamiast wołacza z ramek („Anno”); „dziś” małą literą na początku linii | `vocative`, `upperFirst` |
| Szkic | Zapisany szkic z wczorajszą datą byłby odrzucany przez nową walidację dat | Przeterminowana data jest zastępowana dzisiejszą przy odczycie |

### Wyniki po zmianach

- `npm run lint`, `npm run typecheck`: bez błędów i ostrzeżeń.
- `npm test`: 24/24 (mapa 5, kalkulator/daty/wyszukiwanie/powitanie 13, zapis stanu 6), także pod Node 22, którego używa CI. `typecheck` i `lint` przechodzą również bez plików generowanych przez `expo start` (`expo-env.d.ts`, `.expo/`), czyli tak jak w CI.
- `npx expo export --platform all`: poprawny (iOS, Android, web + render serwerowy). `npx expo-doctor`: 20/20.
- Przeglądarka (Chromium przez Playwright, mobile 390 px i desktop 1440 px, dev serwer `expo start --web`), 20 scenariuszy, wszystkie zaliczone w jednym przebiegu na końcowym kodzie, bez błędów w konsoli (pomijane są wyłącznie błędy żądań do `tile.openstreetmap.org`):
  onboarding i rejestracja z walidacją; `/create?step=3` ze złym szkicem; data z przeszłości i nieistniejąca; publikacja i reset szkicu; korekta dla EL-1043 (domyślnie 20, limit 24); pełny odbiór EL-1042 (litery w PIN, 0000 odrzucony, 7429, korekta 40→36, zakończenie, podział 9 zł + 9 zł, zamknięte adresy `/problem`, `/shortage`, `/rejected`); odrzucenie ograniczone do przyjętej liczby; anulowanie i ponowne przyjęcie; odczyt starego i uszkodzonego zapisu; „Usuń moje dane demo”; wyszukiwanie mapy (`zelazna`, ulica + miasto, przełączanie kategorii); zgłoszenie elektroniki z obszarem; zgłoszenie punktu do panelu admina; brak pustego okna przy zamykaniu dialogu; zdjęcie 11,6 MB → 242 KB po odświeżeniu; przeterminowana data zapisanego szkicu zastępowana dzisiejszą; powitanie „Cześć, Anno!”; 16 tras desktopowych renderuje się bez „Nie znaleziono strony”, a 17 tras mobilnych (w tym nieznany punkt i nieistniejąca strona) bez poziomego przewijania.

### Czego nie sprawdzono

- Fizyczny telefon, natywny WebView z mapą, systemowy wybór zdjęć i GPS (tylko web).
- Podpisany build EAS. W `app.json` brak `android.package` i `ios.bundleIdentifier` — trzeba je ustalić zespołowo przed buildem sklepowym.
- `npm audit --omit=dev`: nadal 5 alertów high w łańcuchu Expo CLI (`node-forge`, `zod`). Nie uruchamiano `npm audit fix --force`, bo proponuje obniżenie do Expo SDK 44.
- Różnice względem Figmy, których świadomie nie zmieniano: plan odbiorów jako lista pogrupowana po dniach z sumą „32 zł / 16 zł”, oś czasu na kartach „Moje odbiory”, dane opiekuna odbioru (Michał K., ocena 4,9). Wersja desktopowa jest zgodna z ramkami.

## Aktualizacja: BLIK i numer telefonu

- Zakres: numer telefonu w ustawieniach, kafelek „Odbiór kaucji przelewem” (tylko zwrot w kaucjomacie), wybór „Gotówka lub BLIK” w ogłoszeniu z numerem widocznym dopiero po przyjęciu odbioru. To makieta: nie wykonuje przelewów, a prawdziwa wypłata z automatu wymaga współpracy z operatorem kaucjomatów.
- `npm run verify`: lint i typecheck bez błędów, `npm test` 27/27 (nowe: normalizacja i formatowanie numeru, zapis numeru w stanie, odrzucanie błędnego numeru przy odczycie). Eksport web poprawny.
- Przegląd po wdrożeniu poprawił: zniknięcie numeru z podsumowania, gdy użytkownik usunął go z ustawień po włączeniu przelewu (numer jest teraz zapisywany przy odbiorze), pozostawanie włączonego przelewu po zmianie miejsca zwrotu na punkt ręczny, linię „0 zł” po zwrocie bez przyjętych opakowań, wczytywanie uszkodzonego numeru z pamięci oraz tworzenie profilu demo tylko po to, by usunąć nieistniejący numer.
- Ścieżka BLIK (ustawienia → ogłoszenie z BLIK → przyjęcie → kafelek przy zwrocie → zakończenie) została przejęta w przeglądarce, zob. niżej. Nie sprawdzano jej na fizycznym urządzeniu.

## Aktualizacja: test w działającej aplikacji

Aplikacja (Expo web) była uruchamiana lokalnie i sterowana z headless Chromium (Playwright), w widoku mobilnym 390 px i desktopowym 1280 px.

- Przegląd tras: 32 trasy × 2 szerokości = 64 widoki, bez błędów konsoli, bez przepełnienia poziomego i bez pustych ekranów.
- Scenariusze: BLIK od początku do końca; filtry i wyszukiwanie odbiorów, PIN (zły, litery, 7429); walidacja ogłoszenia (ilość, data, godziny), rejestracja, filtry mapy, formularz elektroniki z kontrolą obszaru, zmiana statusu w panelu administratora; pełny cykl odbioru (korekta 40 → 36 = 18 zł → 9 + 9 zł, zakończenie, zamknięty odbiór, historia); profil, powiadomienia, zgłoszenie nadużycia, status punktu, usunięcie danych demo, wylogowanie.
- Znalezione i naprawione: puste pole w korekcie ilości zapisywało 0 opakowań (`Number("")`), numer telefonu znikał po wylogowaniu i wymagał profilu demo do zapisu (teraz jest w preferencjach), karta własnego ogłoszenia nie pokazywała BLIK.
- Pozostaje bez zmian, zachowanie sprzed BLIK: „Przyjmij odbiór” dokłada na stos kolejną kopię tego samego ekranu.
- Nie sprawdzano: fizycznego urządzenia, GPS, wyboru zdjęć z dysku.
