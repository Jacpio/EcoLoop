import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
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
  Col,
  go,
  Icon,
  photos,
  Row,
  Shell,
  T,
} from "./ui";

const slides = [
  {
    image: photos.return,
    tag: "Butelki i puszki",
    title: "Znajdź swój kaucjomat",
    body: "Oddaj butelki PET i puszki ze znakiem kaucji. Sprawdź przyjmowane opakowania i godziny punktu.",
  },
  {
    image: photos.neighbors,
    tag: "Po sąsiedzku",
    title: "Oddaj bez wychodzenia",
    body: "Dodaj opakowania i ustal udział w kaucji. Zbierający odbierze je w umówionym czasie.",
  },
  {
    image: photos.collector,
    tag: "Mały krok. Dobry obieg.",
    title: "Zbieraj po drodze",
    body: "Połącz sąsiedzkie odbiory w jedną trasę i oddaj opakowania w odpowiednim punkcie.",
  },
];
const nativeDriver = Platform.OS !== "web";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const busy = useRef(true);
  const direction = useRef(1);
  const [opacity] = useState(() => new Animated.Value(0));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [translate] = useState(() => new Animated.Value(22));
  const [zoom] = useState(() => new Animated.Value(1.045));
  const [indicator] = useState(() => new Animated.Value(0));
  const runningExit = useRef<Animated.CompositeAnimation | null>(null);
  const { update } = useEco();

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
      runningExit.current?.stop();
    };
  }, []);

  useEffect(() => {
    opacity.setValue(reduceMotion ? 1 : 0);
    textOpacity.setValue(reduceMotion ? 1 : 0);
    translate.setValue(reduceMotion ? 0 : direction.current * 26);
    zoom.setValue(reduceMotion ? 1 : 1.045);
    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: reduceMotion ? 0 : 330,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        delay: reduceMotion ? 0 : 65,
        duration: reduceMotion ? 0 : 300,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: reduceMotion ? 0 : 390,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: nativeDriver,
      }),
    ]);
    const photo = Animated.timing(zoom, {
      toValue: 1,
      duration: reduceMotion ? 0 : 760,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    });
    const dots = Animated.timing(indicator, {
      toValue: step,
      duration: reduceMotion ? 0 : 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    entrance.start(({ finished }) => {
      if (finished) {
        busy.current = false;
        setAnimating(false);
      }
    });
    photo.start();
    dots.start();
    return () => {
      entrance.stop();
      photo.stop();
      dots.stop();
    };
  }, [step, reduceMotion, opacity, textOpacity, translate, zoom, indicator]);

  const transitionTo = (next: number) => {
    if (busy.current || next === step || next < 0 || next >= slides.length)
      return;
    busy.current = true;
    setAnimating(true);
    direction.current = next > step ? 1 : -1;
    runningExit.current = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: reduceMotion ? 0 : 125,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: reduceMotion ? 0 : 100,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(translate, {
        toValue: reduceMotion ? 0 : -direction.current * 20,
        duration: reduceMotion ? 0 : 125,
        useNativeDriver: nativeDriver,
      }),
    ]);
    runningExit.current.start(({ finished }) => {
      if (finished) setStep(next);
    });
  };
  const latestTransition = useRef(transitionTo);
  useEffect(() => {
    latestTransition.current = transitionTo;
  });
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const swipe = useMemo(
    () =>
      // PanResponder stores these callbacks and invokes them only for touch events.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) > 45)
            latestTransition.current(
              stepRef.current + (gesture.dx < 0 ? 1 : -1),
            );
        },
      }),
    [],
  );
  const finish = () => {
    if (busy.current) return;
    update((s) => ({ ...s, onboarded: true }));
    go("register");
  };
  const slide = slides[step];
  return (
    <Shell tab={false} bare>
      <View style={styles.page}>
        <Row
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <Brand />
          <Button ghost small disabled={animating} onPress={finish}>
            Pomiń
          </Button>
        </Row>
        <Animated.View
          {...swipe.panHandlers}
          accessibilityLabel="Przesuń zdjęcie w lewo lub w prawo, aby zmienić slajd"
          style={{
            opacity,
            transform: [{ translateX: translate }],
            width: "100%",
            aspectRatio: 1.1,
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { transform: [{ scale: zoom }] }]}
          >
            <Image
              source={slide.image}
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        </Animated.View>
        <Animated.View
          accessibilityLiveRegion="polite"
          style={{
            opacity: textOpacity,
            transform: [{ translateX: translate }],
            minHeight: 164,
          }}
        >
          <Row
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Badge>{slide.tag}</Badge>
            <T muted bold size={13}>
              0{step + 1} / 03
            </T>
          </Row>
          <T
            accessibilityRole="header"
            size={29}
            bold
            style={{ marginTop: 15, letterSpacing: -0.7 }}
          >
            {slide.title}
          </T>
          <T size={17} muted style={{ marginTop: 10 }}>
            {slide.body}
          </T>
        </Animated.View>
        <View style={styles.categories}>
          <Row style={{ alignItems: "center", gap: 8, flex: 1 }}>
            <Icon name="recycle" size={21} color={C.brand} />
            <Col style={{ gap: 0 }}>
              <T bold size={12} color={C.brand}>
                Butelki i puszki
              </T>
              <T muted size={11}>
                Zwrot w kaucjomacie
              </T>
            </Col>
          </Row>
          <View style={{ width: 1, backgroundColor: C.line }} />
          <Row style={{ alignItems: "center", gap: 8, flex: 1 }}>
            <Icon name="plug" size={21} color={C.electro} />
            <Col style={{ gap: 0 }}>
              <T bold size={12} color={C.electro}>
                Elektronika
              </T>
              <T muted size={11}>
                Osobno w EcoElectro
              </T>
            </Col>
          </Row>
        </View>
        <Row style={{ marginTop: 13, marginBottom: 12, gap: 1 }}>
          {slides.map((_, i) => (
            <Pressable
              key={i}
              accessibilityLabel={`Slajd ${i + 1}`}
              accessibilityRole="button"
              accessibilityState={{ selected: i === step, disabled: animating }}
              disabled={animating}
              onPress={() => transitionTo(i)}
              style={{ paddingVertical: 12, paddingRight: 9 }}
            >
              <Animated.View
                style={{
                  width: indicator.interpolate({
                    inputRange: [i - 1, i, i + 1],
                    outputRange: [7, 29, 7],
                    extrapolate: "clamp",
                  }),
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: C.brand,
                  opacity: indicator.interpolate({
                    inputRange: [i - 1, i, i + 1],
                    outputRange: [0.25, 1, 0.25],
                    extrapolate: "clamp",
                  }),
                }}
              />
            </Pressable>
          ))}
        </Row>
        <Row>
          {step > 0 && (
            <Button
              secondary
              icon="back"
              label="Poprzedni slajd"
              disabled={animating}
              onPress={() => transitionTo(step - 1)}
            >
              Wstecz
            </Button>
          )}
          <Button
            icon="arrow"
            style={{ flex: 1 }}
            disabled={animating}
            onPress={() =>
              step < slides.length - 1 ? transitionTo(step + 1) : finish()
            }
          >
            {step < slides.length - 1 ? "Dalej" : "Rozpocznij"}
          </Button>
        </Row>
        <T size={12} muted style={{ textAlign: "center", marginTop: 16 }}>
          Demo EcoLoop · bez rzeczywistych płatności
        </T>
      </View>
    </Shell>
  );
}
const styles = StyleSheet.create({
  page: {
    padding: 22,
    paddingTop: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  categories: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: C.paper,
    marginTop: 16,
  },
});
