import { EcoContext } from "./context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Collection,
  Electronic,
  initialDraft,
  initialElectronics,
  initialOffers,
  Offer,
} from "./domain";

export type Report = {
  id: string;
  title: string;
  target: string;
  priority: string;
  status: string;
  note: string;
};
type State = {
  onboarded: boolean;
  user: { name: string; role: string } | null;
  offers: Offer[];
  collections: Collection[];
  electronics: Electronic[];
  reports: Report[];
  pointStatus: Record<string, string>;
  draft: Offer;
  notifications: boolean;
  ecoPoints: number;
  preferences: { area: string; radius: string };
  partnerArea: string;
  partnerHours: string;
};
const initialState: State = {
  onboarded: false,
  user: null,
  offers: initialOffers,
  collections: [],
  electronics: initialElectronics,
  pointStatus: {},
  draft: initialDraft,
  notifications: false,
  ecoPoints: 1250,
  preferences: { area: "Warszawa, Centrum", radius: "3 km" },
  partnerArea: "Śródmieście, Wola, Mokotów",
  partnerHours: "Pon.–pt. 08:00–16:00",
  reports: [
    {
      id: "Z-071",
      title: "Automat nie przyjmuje opakowań",
      target: "Market Centrum",
      priority: "Wysoki",
      status: "W trakcie sprawdzania",
      note: "Urządzenie wyświetla błąd. Proszę sprawdzić przed kolejną wizytą.",
    },
    {
      id: "Z-070",
      title: "Aktualizacja godzin",
      target: "Punkt Hala Mirowska",
      priority: "Normalny",
      status: "Nowe",
      note: "Zweryfikuj godziny otwarcia punktu.",
    },
    {
      id: "Z-069",
      title: "Zgłoszenie nadużycia",
      target: "Użytkownik U-084",
      priority: "Wysoki",
      status: "Nowe",
      note: "Zgłoszenie wymaga sprawdzenia.",
    },
    {
      id: "Z-068",
      title: "Brak godzin",
      target: "Nowy punkt",
      priority: "Normalny",
      status: "Nowe",
      note: "Uzupełnij dane punktu.",
    },
  ],
};
type Dialog = {
  title: string;
  body: string;
  placeholder?: string;
  initialValue?: string;
  confirm?: string;
  onConfirm?: (value: string) => void;
  multiline?: boolean;
};
export type Context = {
  state: State;
  ready: boolean;
  update: (fn: (state: State) => State) => void;
  dialog: (dialog: Dialog) => void;
  notify: (text: string) => void;
  reset: () => void;
  requireUser: (action: () => void) => void;
};

const STORAGE_KEY = "ecoloop-demo-v1";
export function EcoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [activeDialog, setDialog] = useState<Dialog | null>(null);
  const [value, setValue] = useState("");
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw);
            if (
              Array.isArray(saved.offers) &&
              Array.isArray(saved.collections) &&
              Array.isArray(saved.electronics) &&
              Array.isArray(saved.reports)
            )
              setState({ ...initialState, ...saved });
          } catch {
            /* Recover from corrupt local demo data. */
          }
        }
      })
      .catch(() =>
        setToast(
          "Pamięć urządzenia jest niedostępna. Dane zachowamy w tej sesji.",
        ),
      )
      .finally(() => setReady(true));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() =>
        setToast("Nie udało się zapisać danych na urządzeniu."),
      );
  }, [state, ready]);
  const dialog = (d: Dialog) => {
    setValue(d.initialValue || "");
    setDialog(d);
  };
  const notify = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4500);
  };
  const requireUser = (action: () => void) => {
    if (state.user) action();
    else
      dialog({
        title: "Kontynuuj w wersji demo",
        body: "Utworzymy lokalny profil demonstracyjny Anny Kowalskiej. Dane i rozliczenia są symulowane.",
        confirm: "Kontynuuj jako Anna",
        onConfirm: () => {
          setState((s) => ({
            ...s,
            user: { name: "Anna Kowalska", role: "Oddaję" },
            onboarded: true,
          }));
          action();
        },
      });
  };
  return (
    <EcoContext.Provider
      value={{
        state,
        ready,
        update: setState,
        dialog,
        notify,
        reset: () => setState(initialState),
        requireUser,
      }}
    >
      {ready ? (
        children
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "#F7F4ED",
          }}
        >
          <ActivityIndicator color="#793E4B" />
        </View>
      )}
      {!!toast && (
        <Pressable
          accessibilityRole="alert"
          onPress={() => setToast("")}
          style={styles.toast}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Pressable>
      )}
      <Modal
        visible={!!activeDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setDialog(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.title}>
              {activeDialog?.title}
            </Text>
            <Text style={styles.body}>{activeDialog?.body}</Text>
            {activeDialog?.placeholder && (
              <TextInput
                autoFocus
                accessibilityLabel={activeDialog.placeholder}
                placeholder={activeDialog.placeholder}
                value={value}
                onChangeText={setValue}
                multiline={activeDialog.multiline}
                style={styles.input}
              />
            )}
            <Pressable
              accessibilityRole="button"
              style={styles.primary}
              onPress={() => {
                if (activeDialog?.placeholder && !value.trim()) return;
                const d = activeDialog;
                setDialog(null);
                d?.onConfirm?.(value.trim());
              }}
            >
              <Text style={styles.white}>
                {activeDialog?.confirm || "Rozumiem"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.secondary}
              onPress={() => setDialog(null)}
            >
              <Text style={styles.body}>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </EcoContext.Provider>
  );
}
export function useEco() {
  const context = useContext(EcoContext);
  if (!context) throw new Error("EcoProvider is required");
  return context;
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#30282077",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    padding: 26,
    gap: 18,
    backgroundColor: "#FFFCF7",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D4C4B4",
  },
  title: { fontFamily: "EcoBold", fontSize: 25, color: "#302920" },
  body: { fontFamily: "Eco", fontSize: 16, lineHeight: 23, color: "#776B60" },
  input: {
    borderWidth: 1,
    borderColor: "#CBBBAB",
    padding: 14,
    borderRadius: 10,
    fontFamily: "Eco",
    fontSize: 16,
    color: "#302920",
    minHeight: 52,
  },
  primary: {
    backgroundColor: "#793E4B",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  secondary: { padding: 6, alignItems: "center" },
  white: { color: "white", fontFamily: "EcoBold", fontSize: 16 },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    maxWidth: 560,
    marginHorizontal: 20,
    backgroundColor: "#302920",
    borderRadius: 10,
    padding: 16,
    zIndex: 100,
  },
  toastText: { fontFamily: "Eco", fontSize: 16, color: "#FFFCF7" },
});
