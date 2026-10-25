import React from "react";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useEco } from "./store";
import { points, type PointCategory } from "./domain";
import MapSurface from "./maps/map-surface";
import type { MapFocus } from "./maps/types";

export const C = {
  bg: "#F7F4ED",
  paper: "#FFFCF7",
  ink: "#302920",
  muted: "#7C6E62",
  line: "#D4C4B4",
  wash: "#EEE7DC",
  brand: "#793E4B",
  electro: "#326F68",
  electroBg: "#E3EEEB",
  pink: "#F0E3E5",
  green: "#446951",
  greenBg: "#E7EDE4",
  amber: "#916017",
  amberBg: "#F6EAD0",
};
export const photos = {
  hero: require("../../assets/ecoloop/hero.jpg"),
  neighbors: require("../../assets/ecoloop/neighbors.jpg"),
  return: require("../../assets/ecoloop/return.jpg"),
  collector: require("../../assets/ecoloop/collector.jpg"),
  electronics: require("../../assets/ecoloop/electronics.jpg"),
};
export function useDesktop() {
  return useWindowDimensions().width >= 900;
}
export function go(screen = "", params: Record<string, string> = {}) {
  if (screen)
    router.push({ pathname: "/[screen]", params: { ...params, screen } });
  else router.push({ pathname: "/", params });
}
export function Icon({
  name,
  size = 22,
  color = C.muted,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const paths: Record<string, string> = {
    loop: "M3 10V3h12l4 4M3 3l-3 4m3-4l4 4M21 14v7H9l-4-4m16 4l-4-4m4 4l3-4",
    home: "M3 10l9-7 9 7v11h-6v-8H9v8H3z",
    map: "M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zm6-2v16m6-14v16",
    box: "M3 7l9-5 9 5v11l-9 5-9-5zm0 0l9 5 9-5M12 12v11M7 4.5l10 5.5",
    user: "M4 22v-3a8 8 0 0116 0v3M12 12a5 5 0 100-10 5 5 0 000 10",
    pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0z",
    search: "M21 21l-5-5M18 10a8 8 0 11-16 0 8 8 0 0116 0z",
    plus: "M12 4v16M4 12h16",
    arrow: "M3 12h17m-7-7l7 7-7 7",
    back: "M20 12H3m7-7l-7 7 7 7",
    shield: "M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6zm-5 9l3 3 7-7",
    flag: "M4 22V3c6-4 9 5 16 0v11c-7 5-10-4-16 0",
    clock: "M12 7v6l4 2",
    navigate: "M22 2L3 10l8 3 3 8zM11 13L22 2",
    check: "M4 12l5 5L20 6",
    close: "M5 5l14 14M19 5L5 19",
    mail: "M2 5h20v14H2zm0 0l10 8L22 5",
    lock: "M5 10h14v12H5zm3 0V6a4 4 0 018 0v4",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z",
    hand: "M7 13V5a2 2 0 014 0v7-9a2 2 0 014 0v9-7a2 2 0 014 0v8-4a2 2 0 014 0v6c0 6-4 8-8 8-3 0-5-2-7-5l-3-4a2 2 0 013-2l2 2",
    plug: "M8 2v6m8-6v6M5 8h14v5a7 7 0 01-14 0zm7 12v4",
    recycle:
      "M9 3l3-2 4 7m0 0l-5-1m5 1l2-5M5 9l-4 7 2 3h8m-6-10l1 5m-1-5l-5 1m20 2l3 6-2 3h-7m0 0l3-4m-3 4l3 3",
    info: "M12 10v7m0-11v.5",
    calendar:
      "M3 5h18v17H3zM7 2v6m10-6v6M3 11h18m-13 4h1m4 0h1m4 0h1m-10 4h1m4 0h1",
    chevron: "M9 5l7 7-7 7",
    down: "M5 9l7 7 7-7",
    bell: "M3 17h18l-3-4V8a6 6 0 00-12 0v5zm7 4h4",
    grid: "M2 2h7v7H2zm13 0h7v7h-7zM2 15h7v7H2zm13 0h7v7h-7z",
    gift: "M2 8h20v5H2zm2 5v9h16v-9M12 8v14M12 8C1 9 4-3 12 8c8-11 11 1 0 0",
    target: "M12 0v5m0 14v5M0 12h5m14 0h5",
    upload: "M12 16V2m-5 5l5-5 5 5M3 15v7h18v-7",
    message: "M3 3h18v14H8l-5 5z",
    coffee: "M3 7h14v12H3zM17 8h3a4 4 0 010 8h-3M7 2v2m5-2v2",
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {["clock", "info", "target"].includes(name) && (
        <Circle cx="12" cy="12" r={name === "target" ? 7 : 10} />
      )}
      {["pin", "eye", "target"].includes(name) && (
        <Circle
          cx="12"
          cy={name === "pin" ? 10 : 12}
          r={name === "target" ? 2 : 3}
        />
      )}
      <Path d={paths[name] || paths.box} />
    </Svg>
  );
}
export function T({
  children,
  style,
  size = 16,
  bold = false,
  muted = false,
  color,
  ...props
}: {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
  bold?: boolean;
  muted?: boolean;
  color?: string;
} & Pick<
  React.ComponentProps<typeof Text>,
  "accessibilityRole" | "numberOfLines"
>) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: bold ? "EcoBold" : "Eco",
          fontSize: size,
          lineHeight: size * 1.42,
          color: color || (muted ? C.muted : C.ink),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Row({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.row, style]}>{children}</View>;
}
export function Col({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ gap: 14 }, style]}>{children}</View>;
}
export function Card({
  children,
  style,
  wash = false,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  wash?: boolean;
}) {
  return (
    <View style={[s.card, wash && { backgroundColor: C.wash }, style]}>
      {children}
    </View>
  );
}
export function LineDivider() {
  return (
    <View style={{ height: 1, backgroundColor: C.line, marginVertical: 3 }} />
  );
}
export function Badge({
  children,
  green,
  amber,
}: {
  children: React.ReactNode;
  green?: boolean;
  amber?: boolean;
}) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: green ? C.greenBg : amber ? C.amberBg : C.pink,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <T
        size={12}
        color={green ? C.green : amber ? C.amber : C.brand}
        bold={green}
      >
        {children}
      </T>
    </View>
  );
}
export function Button({
  children,
  onPress,
  secondary,
  ghost,
  icon,
  disabled,
  style,
  small,
  label,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  ghost?: boolean;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label || (typeof children === "string" ? children : undefined)
      }
      disabled={disabled}
      onPress={onPress}
      style={(state) => [
        s.button,
        {
          minHeight: small ? 36 : 48,
          paddingHorizontal: small ? 12 : 18,
          backgroundColor: secondary
            ? C.paper
            : ghost
              ? "transparent"
              : C.brand,
          borderColor: ghost ? "transparent" : secondary ? C.line : C.brand,
          opacity: disabled ? 0.45 : state.pressed ? 0.7 : 1,
        },
        // `hovered` is provided by react-native-web only, so it is absent from the native types.
        (state as { hovered?: boolean }).hovered &&
          !disabled && { borderColor: C.brand },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          color={secondary || ghost ? C.brand : C.paper}
        />
      )}
      <T
        size={small ? 13 : 16}
        color={secondary ? C.ink : ghost ? C.brand : C.paper}
      >
        {children}
      </T>
    </Pressable>
  );
}
export function Input({
  label,
  icon,
  style,
  ...props
}: TextInputProps & { label?: string; icon?: string }) {
  return (
    <View style={[{ gap: 6 }, style as ViewStyle]}>
      {label && <T size={14}>{label}</T>}
      <View style={s.inputWrap}>
        <TextInput
          accessibilityLabel={label || props.placeholder}
          placeholderTextColor={C.muted}
          {...props}
          style={[
            s.input,
            props.multiline && { minHeight: 86, textAlignVertical: "top" },
          ]}
        />
        {icon && (
          <View style={{ paddingRight: 14 }}>
            <Icon name={icon} size={19} />
          </View>
        )}
      </View>
    </View>
  );
}
export function Chips({
  options,
  value,
  onChange,
  style,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Row style={[{ flexWrap: "wrap", gap: 8 }, style]}>
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
          onPress={() => onChange(option)}
          style={[
            s.chip,
            value === option && {
              backgroundColor: C.pink,
              borderColor: C.brand,
            },
          ]}
        >
          <T size={13} color={value === option ? C.brand : C.muted}>
            {option}
          </T>
        </Pressable>
      ))}
    </Row>
  );
}
export function Note({
  children,
  amber = false,
}: {
  children: React.ReactNode;
  amber?: boolean;
}) {
  return (
    <View
      style={[
        s.note,
        amber && { backgroundColor: C.amberBg, borderColor: C.amber },
      ]}
    >
      <Icon name="info" size={18} color={amber ? C.amber : C.muted} />
      <T
        muted
        size={13}
        style={{ flex: 1 }}
        color={amber ? C.amber : undefined}
      >
        {children}
      </T>
    </View>
  );
}
export function Heading({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const desktop = useDesktop();
  return (
    <View style={{ gap: 10, marginBottom: desktop ? 24 : 8 }}>
      {eyebrow && (
        <T size={12} color={C.brand} style={{ letterSpacing: 1.8 }}>
          {eyebrow}
        </T>
      )}
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <T
          accessibilityRole="header"
          size={desktop ? 32 : 25}
          bold
          style={{ flex: 1 }}
        >
          {title}
        </T>
        {action}
      </Row>
      {subtitle && <T muted>{subtitle}</T>}
    </View>
  );
}
export function Brand() {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="EcoLoop – strona główna"
      onPress={() => go()}
    >
      <Row style={{ gap: 9, alignItems: "center" }}>
        <View style={s.logo}>
          <Icon name="loop" color={C.paper} size={22} />
        </View>
        <T size={25} bold style={{ letterSpacing: -0.9 }}>
          EcoLoop
        </T>
      </Row>
    </Pressable>
  );
}
export function Topbar() {
  const path = usePathname();
  const { state } = useEco();
  return (
    <View style={s.topbar}>
      <View style={s.navInner}>
        <Brand />
        <Row style={{ flex: 1, gap: 28, marginLeft: 30 }}>
          {[
            ["Mapa", "map"],
            ["Oddaj opakowania", "create"],
            ["Zarabiaj", "collect"],
            ["Elektro", "electro"],
          ].map(([name, screen]) => (
            <Pressable
              accessibilityRole="link"
              key={screen}
              onPress={() => go(screen)}
            >
              <T size={14} color={path === "/" + screen ? C.brand : C.muted}>
                {name}
              </T>
            </Pressable>
          ))}
        </Row>
        <View>
          <Badge>
            {state.user
              ? "MVP · demo"
              : path === "/map"
                ? "Tryb gościa"
                : "MVP · demo"}
          </Badge>
        </View>
        <Button ghost icon="user" onPress={() => go("profile")}>
          Konto
        </Button>
      </View>
    </View>
  );
}
const navItems = [
  ["Start", "", "home"],
  ["Mapa", "map", "map"],
  ["Odbiory", "orders", "box"],
  ["Profil", "profile", "user"],
];
export function BottomNav() {
  const path = usePathname();
  return (
    <View style={s.bottomNav}>
      {navItems.map(([label, screen, icon]) => {
        const selected =
          screen === ""
            ? path === "/" || path === "/home"
            : screen === "orders"
              ? [
                  "/orders",
                  "/collect",
                  "/create",
                  "/collection",
                  "/plan",
                  "/problem",
                  "/shortage",
                  "/rejected",
                ].includes(path)
              : path.startsWith("/" + screen) ||
                (screen === "map" && path === "/point");
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => go(screen)}
            style={s.navItem}
          >
            <Icon name={icon} color={selected ? C.brand : C.muted} />
            <T size={12} color={selected ? C.brand : C.muted} bold={selected}>
              {label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Shell({
  children,
  title,
  tab = true,
  sidebar,
  full = false,
  bare = false,
}: {
  children: React.ReactNode;
  title?: string;
  tab?: boolean;
  sidebar?: "profile" | "partner" | "admin";
  full?: boolean;
  bare?: boolean;
}) {
  const desktop = useDesktop();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.bg }}
      edges={["top", "left", "right", "bottom"]}
    >
      {desktop && <Topbar />}
      {!desktop && title && (
        <Row style={s.mobileHeader}>
          <T accessibilityRole="header" size={25} bold style={{ flex: 1 }}>
            {title}
          </T>
          <Button
            secondary
            small
            icon="plus"
            label="Dodaj ogłoszenie"
            onPress={() => go("create")}
          >
            <T size={1}> </T>
          </Button>
        </Row>
      )}
      <Row style={{ flex: 1, gap: 0 }}>
        {desktop && sidebar && <Sidebar type={sidebar} />}
        <ScrollView
          key={title}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          style={{ flex: 1 }}
          contentContainerStyle={[
            { flexGrow: 1 },
            !bare && { padding: desktop ? 28 : 20 },
            full && { padding: 0 },
          ]}
        >
          <View
            style={[
              !bare &&
                !full && {
                  width: "100%",
                  maxWidth: sidebar ? 1400 : 1480,
                  alignSelf: "center",
                },
              { flexGrow: 1 },
            ]}
          >
            {children}
          </View>
        </ScrollView>
      </Row>
      {desktop && !bare && (
        <View style={s.demoFooter}>
          <T muted size={11}>
            EcoLoop / demonstracja · rozliczenia symulowane · kwoty szacunkowe
            do zwrotu
          </T>
          <T muted size={11}>
            Dane przykładowe · 25.10.2026
          </T>
        </View>
      )}
      {!desktop && tab && <BottomNav />}
    </SafeAreaView>
  );
}
function Sidebar({ type }: { type: "profile" | "partner" | "admin" }) {
  const { state, dialog } = useEco();
  const path = usePathname();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const isActive = (label: string, screen: string, i: number) =>
    type === "profile"
      ? path === "/" + screen
      : section
        ? section === label
        : i === 0;
  const items =
    type === "profile"
      ? [
          ["Podsumowanie", "profile", "grid"],
          ["Moje odbiory", "orders", "box"],
          ["Plan odbiorów", "plan", "map"],
          ["Historia", "history", "clock"],
          ["Bezpieczeństwo", "safety", "shield"],
        ]
      : type === "partner"
        ? [
            ["Zgłoszenia", "partner", "grid"],
            ["Harmonogram", "partner", "calendar"],
            ["Obszar działania", "partner", "map"],
            ["Dokumentacja", "partner", "box"],
            ["Zespół", "partner", "user"],
          ]
        : [
            ["Przegląd", "admin", "grid"],
            ["Punkty i usterki", "admin", "box"],
            ["Użytkownicy", "admin", "map"],
            ["Nadużycia", "admin", "flag"],
            ["Partnerzy", "partner", "user"],
            ["Nagrody", "rewards", "gift"],
          ];
  return (
    <View style={s.sidebar}>
      <T size={11} bold muted>
        PANEL ECOLOOP
      </T>
      <T bold size={18} style={{ marginBottom: 12 }}>
        {type === "profile"
          ? state.user?.name || "Twoje konto"
          : type === "partner"
            ? "Partner elektro"
            : "Administrator"}
      </T>
      {items.map(([label, screen, icon], i) => (
        <Pressable
          accessibilityRole="link"
          key={label}
          onPress={() => {
            if (path === "/" + screen && i > 0) go(screen, { section: label });
            else go(screen);
          }}
          style={[
            s.sidebarItem,
            isActive(label, screen, i) && {
              backgroundColor: C.paper,
              borderColor: C.line,
            },
          ]}
        >
          <Icon
            name={icon}
            size={19}
            color={isActive(label, screen, i) ? C.brand : C.muted}
          />
          <T size={14} color={isActive(label, screen, i) ? C.brand : C.muted}>
            {label}
          </T>
        </Pressable>
      ))}
      <View style={{ marginTop: 16 }}>
        <Note>Dane i operacje w tym panelu są demonstracyjne.</Note>
      </View>
      <Button ghost onPress={() => go("help")}>
        Potrzebujesz pomocy? →
      </Button>
      <Button
        ghost
        small
        onPress={() =>
          dialog({
            title: "Wersja demonstracyjna",
            body: "Przełączanie paneli pozwala obejrzeć wszystkie role prototypu. Nie nadaje uprawnień do rzeczywistych danych.",
          })
        }
      >
        O tej wersji
      </Button>
    </View>
  );
}
export function Empty({
  title,
  text,
  action,
  onPress,
}: {
  title: string;
  text: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 32 }}>
      <Icon name="box" size={36} color={C.brand} />
      <T bold size={22}>
        {title}
      </T>
      <T muted style={{ textAlign: "center" }}>
        {text}
      </T>
      {action && onPress && <Button onPress={onPress}>{action}</Button>}
    </Card>
  );
}
export function MapCanvas({
  height = 300,
  onSelect,
  selected = "",
  children,
  category = "packaging",
  pointIds,
  focus,
  rightInset = 0,
}: {
  height?: number;
  onSelect?: (id: string) => void;
  selected?: string;
  children?: React.ReactNode;
  category?: PointCategory;
  pointIds?: string[];
  focus?: MapFocus;
  rightInset?: number;
}) {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const { state } = useEco();
  const visible = points
    .filter(
      (point) =>
        point.category === category &&
        (!pointIds || pointIds.includes(point.id)),
    )
    .map((point) => ({
      ...point,
      status: state.pointStatus[point.id] || point.status,
    }));
  return (
    <View
      style={{
        height,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: C.line,
        overflow: "hidden",
        backgroundColor: C.wash,
      }}
    >
      <MapSurface
        config={{ points: visible, selected, rightInset, focus }}
        onSelect={(id) => (onSelect ? onSelect(id) : go("point", { id }))}
        onReady={() => setReady(true)}
        onTileError={setFailed}
      />
      {!ready && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.wash,
            },
          ]}
        >
          <ActivityIndicator color={C.brand} />
          <T muted size={13}>
            Wczytuję OpenStreetMap…
          </T>
        </View>
      )}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: rightInset ? undefined : 10,
          maxWidth: 260,
          backgroundColor: C.paper,
          borderRadius: 7,
          padding: 8,
        }}
      >
        <Row style={{ alignItems: "center", gap: 6 }}>
          <Icon
            name={category === "electronics" ? "plug" : "recycle"}
            size={16}
            color={category === "electronics" ? C.electro : C.brand}
          />
          <T size={11} color={category === "electronics" ? C.electro : C.brand}>
            {category === "electronics"
              ? "Elektronika · osobne punkty"
              : "Butelki i puszki · zwrot kaucji"}
          </T>
        </Row>
        <T size={10} muted>
          OpenStreetMap · punkty przykładowe
        </T>
      </View>
      {failed && (
        <View
          accessibilityRole="alert"
          style={{
            position: "absolute",
            left: 55,
            right: 15,
            bottom: 40,
            backgroundColor: C.paper,
            borderColor: C.line,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <T size={13}>
            Nie udało się pobrać mapy. Sprawdź połączenie z internetem. Lista
            punktów nadal jest dostępna.
          </T>
        </View>
      )}
      {children}
    </View>
  );
}
export const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  card: {
    backgroundColor: C.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    gap: 12,
  },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  inputWrap: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 13,
    paddingVertical: 13,
    color: C.ink,
    fontFamily: "Eco",
    fontSize: 16,
  },
  chip: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 9,
    minHeight: 41,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  note: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: C.wash,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    padding: 13,
  },
  logo: {
    width: 35,
    height: 35,
    backgroundColor: C.brand,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  topbar: {
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  navInner: {
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center",
    paddingHorizontal: 36,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 12 : 5,
  },
  navItem: { flex: 1, alignItems: "center", gap: 5, paddingVertical: 3 },
  mobileHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    alignItems: "center",
    backgroundColor: C.bg,
  },
  sidebar: {
    width: 220,
    backgroundColor: C.wash,
    padding: 22,
    borderRightWidth: 1,
    borderColor: C.line,
    gap: 10,
  },
  sidebarItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
  },
  demoFooter: {
    backgroundColor: C.wash,
    paddingHorizontal: 28,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
