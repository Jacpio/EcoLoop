import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  GoogleResult,
  GoogleSignIn,
  googleIosClientId,
  googleWebClientId,
} from "./config";

// The native module is missing in Expo Go, so it is loaded lazily and only
// inside a development or store build.
const inExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let lib: typeof import("@react-native-google-signin/google-signin") | null =
  null;
if (!inExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lib = require("@react-native-google-signin/google-signin");
    lib?.GoogleSignin.configure({
      webClientId: googleWebClientId,
      iosClientId: googleIosClientId,
    });
  } catch {
    lib = null;
  }
}

async function signIn(): Promise<GoogleResult> {
  if (!lib)
    return {
      error:
        "Logowanie Google wymaga wersji deweloperskiej aplikacji (nie działa w Expo Go).",
    };
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } =
    lib;
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    const { name, email } = response.data.user;
    return { name: name || email, email };
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.IN_PROGRESS) return null;
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return { error: "Usługi Google Play są niedostępne na tym urządzeniu." };
    }
    return { error: "Nie udało się zalogować przez Google. Spróbuj ponownie." };
  }
}

export async function signOutGoogle() {
  try {
    await lib?.GoogleSignin.signOut();
  } catch {}
}

export function useGoogleSignIn(): GoogleSignIn {
  return { available: !!lib, signIn };
}
