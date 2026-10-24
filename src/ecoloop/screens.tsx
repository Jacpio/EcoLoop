import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Home, Onboarding } from "./landing";
import { MapScreen, PointScreen } from "./map";
import {
  CollectScreen,
  CollectionScreen,
  CreateScreen,
  OrdersScreen,
  PlanScreen,
  ProblemScreen,
} from "./pickup";
import { AuthScreen, ProfileScreen, UtilityScreen } from "./account";
import { ElectroForm, ElectroScreen } from "./electronics";
import { AdminScreen, PartnerScreen } from "./panels";
import { Empty, go, Shell } from "./ui";
export function AppScreen() {
  const { screen, donation, section } = useLocalSearchParams<{
    screen: string;
    donation?: string;
    section?: string;
    category?: string;
    type?: string;
  }>();
  switch (screen) {
    case "home":
      return <Home />;
    case "onboarding":
      return <Onboarding />;
    case "map":
      return <MapScreen />;
    case "point":
      return <PointScreen />;
    case "create":
      return <CreateScreen />;
    case "collect":
      return <CollectScreen />;
    case "collection":
      return <CollectionScreen />;
    case "orders":
      return <OrdersScreen />;
    case "plan":
      return <PlanScreen />;
    case "problem":
    case "shortage":
    case "rejected":
      return <ProblemScreen kind={screen} />;
    case "login":
      return <AuthScreen key="login" />;
    case "register":
      return <AuthScreen register key="register" />;
    case "profile":
      return <ProfileScreen />;
    case "electro":
      return <ElectroScreen />;
    case "electro-form":
      return <ElectroForm donation={donation === "true"} />;
    case "partner":
      return <PartnerScreen key={section || "overview"} />;
    case "admin":
      return <AdminScreen key={section || "overview"} />;
    case "notifications":
    case "preferences":
    case "safety":
    case "abuse":
    case "help":
    case "history":
    case "rewards":
      return <UtilityScreen screen={screen} />;
    default:
      return (
        <Shell title="EcoLoop">
          <Empty
            title="Nie znaleziono strony"
            text="Wróć do dobrego obiegu."
            action="Strona główna"
            onPress={() => go()}
          />
        </Shell>
      );
  }
}
