# EcoLoop

Aplikacja Expo / React Native na Androida, iOS i web. Interfejs jest po polsku, a układy dopasowują się do szerokości ekranu. Zdjęcia pochodzą z dostarczonych wzorców. Mapy są interaktywne i pobierają kafelki OpenStreetMap.

## Uruchomienie

W tym folderze:

```sh
npm install
npm start
```

W terminalu Expo wybierz `w`, aby otworzyć wersję webową, lub zeskanuj QR kompatybilną wersją Expo Go. Projekt korzysta z Expo SDK 58. Można też uruchomić `npm run web`. Wymagany jest Node.js 22 lub nowszy (testy jednostkowe ładują pliki `.ts` bezpośrednio).

## Ekrany i ścieżki

- `/`: strona webowa na szerokim ekranie; na telefonie pierwsze uruchomienie z trzema slajdami, a potem ekran startowy.
- `/register`, `/login`: formularze demonstracyjne, wybór roli i wejście jako gość.
- `/map`, `/point?id=market`: osobne kategorie zwrotu butelek/puszek i elektroniki, filtrowanie listy oraz znaczników, szczegóły, zgłaszanie stanu i otwarcie nawigacji OSM. `?category=electronics` otwiera od razu punkty elektroniki.
- `/create`: trzy kroki dodawania ogłoszenia, zdjęcie, rodzaj i ilość opakowań, podział kaucji, okolica, termin i podsumowanie.
- `/collect`: ogłoszenia w okolicy, wyszukiwanie, filtry i sortowanie, przyjęcie odbioru.
- `/orders`, `/collection?id=EL-1042`, `/plan`: odbiory, potwierdzenie przekazania PIN-em, lista trasy i podsumowanie zwrotu.
- `/problem`, `/shortage`, `/rejected` z parametrem `id`: nieobecność, korekta liczby opakowań, odrzucenie w punkcie i zdjęcie do zgłoszenia.
- `/electro`, `/electro-form`: elektronika do uprawnionego partnera; `?donation=true` otwiera osobną ścieżkę sprawnego sprzętu.
- `/profile`, `/history`, `/preferences`, `/notifications`, `/safety`, `/help`, `/abuse`, `/rewards`: konto, historia, preferencje, zasady i podgląd planowanych nagród.
- `/partner`: zgłoszenia elektroniki, terminy, statusy i dokumentacja demonstracyjna.
- `/admin`: sprawy, filtry, zmiana statusu, zgłoszenie nowego punktu do weryfikacji i eksport CSV na webie.

## Działanie wersji demonstracyjnej

Dane zapisują się lokalnie przez AsyncStorage, również po odświeżeniu przeglądarki. Profil, ogłoszenia i odbiory nie synchronizują się między urządzeniami. Hasła nie są zapisywane ani przesyłane. Przyciski logowania zewnętrznego jasno informują o trybie demo. Panele pozwalają obejrzeć wszystkie role bez prawdziwych uprawnień administracyjnych.

PIN przykładowego przekazania to **7429**. Dopiero po jego wpisaniu można zakończyć zwrot, podając rzeczywistą liczbę opakowań. PET i puszki mają w kalkulatorze stawkę 0,50 zł, szkło 1 zł. Rozliczenia są symulowane i nie wykonują płatności. EcoPoints i nagrody pozostają koncepcją, jak we wzorcach.

Numer telefonu do BLIK podasz w Profil → Okolica i preferencje. Przy zwrocie w kaucjomacie pojawia się kafelek „Odbiór kaucji przelewem” (informacja, że automat przeleje kaucję BLIK-iem po przetworzeniu butelek), a w ogłoszeniu można wybrać „Gotówka lub BLIK” i podać numer, który zobaczy dopiero przyjmujący odbiór. To makieta: nie wykonuje przelewów, a prawdziwa wypłata z automatu wymagałaby współpracy z operatorem kaucjomatów.

Mapa korzysta z Leaflet 1.9.4 i kafelków `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Działa na webie oraz w natywnym WebView, obsługuje przesuwanie, przybliżanie i wybór znaczników. Kaucjomaty/ręczny zwrot opakowań i elektronika mają osobne widoki, kolory oraz symbole. Filtry obejmują jednocześnie listę i mapę. Punkty i ich współrzędne są przykładowe; nie jest to publiczny katalog rzeczywistych partnerów ani dostępności na żywo. Przycisk lokalizacji prosi o dostęp wyłącznie na żądanie; pozycja jest używana w bieżącym widoku i nie trafia do lokalnej bazy profilu. Nawigacja pojedynczego punktu otwiera OpenStreetMap. Plan wielopunktowy nadal może otworzyć Google Maps. Czat i dokumentacja zapisują lokalną treść lub nazwę dokumentu, bez wysyłania wiadomości i plików do partnera.

Dane demonstracyjne można przywrócić w Profil → Prywatność i dane → Usuń moje dane demo. Odświeżenie aplikacji po tej operacji ponownie pokaże onboarding mobilny.

Zapisany stan jest przy starcie sprawdzany pole po polu (`src/ecoloop/persist.ts`): uszkodzone lub starsze dane nie wywracają aplikacji, a brakujące pola dostają wartości domyślne. Termin nowego ogłoszenia domyślnie wskazuje dzisiejszy dzień i nie może leżeć w przeszłości. Zdjęcia na webie są przed zapisem zmniejszane do 1024 px, bo cały stan trafia do jednego klucza `localStorage` (ok. 5 MB); na Androidzie i iOS zapisywany jest tylko adres pliku.

## Sprawdzenie projektu

```sh
npm run verify          # lint + typecheck + testy jednostkowe
npm test                # same testy (mapa, kalkulator i daty, zapis stanu)
npx expo export --platform all --output-dir dist
npx expo-doctor
```

Kontrola obejmuje TypeScript, ESLint, testy jednostkowe, produkcyjne paczki web/Android/iOS i diagnostykę zależności. To samo (poza eksportem) uruchamia GitHub Actions (`.github/workflows/ci.yml`) dla każdego pull requesta. Przejście głównych ścieżek w przeglądarce jest opisane w `docs/WERYFIKACJA.md`. Test układu mobilnego w przeglądarce nie zastępuje uruchomienia na rzeczywistym urządzeniu.

## Materiały

- Fotografie: fragmenty PNG przekazanych przez użytkownika.
- Mapa: © OpenStreetMap contributors; przypisanie licencji widoczne na każdej mapie. Kafelki wymagają internetu i korzystają ze standardowego cache przeglądarki/WebView, bez pobierania offline.
- Leaflet 1.9.4 (BSD-2-Clause): skrypt i CSS są pakowane lokalnie w `src/ecoloop/maps/leaflet-vendor.ts`, licencja w tym samym folderze. Po aktualizacji pakietu uruchom `npm run sync-map-vendor`.
- Czcionka Barlow: Google Fonts, SIL Open Font License; licencja w `assets/ecoloop/fonts/OFL.txt`.
- Ikony interfejsu: lokalne wektory SVG. Ikona aplikacji: lokalny znak EcoLoop.

## Samouczek

Animacje wygaszania, przesunięcia zdjęcia i tekstu oraz delikatnego przybliżenia zdjęcia. Animowany wskaźnik postępu, przyciski Dalej/Wstecz i gest przesuwania zdjęcia. Szybkie wielokrotne naciśnięcia są blokowane na czas przejścia. Ustawienie ograniczenia animacji w systemie jest respektowane. Samouczek można obejrzeć ponownie pod `/onboarding`.
