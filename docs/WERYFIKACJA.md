# Weryfikacja EcoLoop

Stan: 25.10.2026. Projekt pozostaje lokalną demonstracją na podstawie obu dostarczonych PNG.

## Wykonane kontrole

- `npm run lint`: bez błędów i ostrzeżeń.
- `npm run typecheck`: bez błędów.
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
