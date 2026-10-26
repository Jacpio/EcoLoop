import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleResult, GoogleSignIn, googleWebClientId } from "./config";

WebBrowser.maybeCompleteAuthSession();

// Reads name and e-mail from the ID token payload. The token is not verified
// here; a backend would have to verify it before trusting it.
function profileFromIdToken(token: string): GoogleResult {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      decodeURIComponent(
        Array.from(atob(payload))
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      ),
    );
    if (typeof json.email !== "string") throw new Error("no email");
    return {
      name: typeof json.name === "string" ? json.name : json.email,
      email: json.email,
    };
  } catch {
    return { error: "Google zwrócił niepoprawne dane logowania." };
  }
}

export async function signOutGoogle() {}

export function useGoogleSignIn(): GoogleSignIn {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleWebClientId,
    selectAccount: true,
  });
  return {
    available: !!request,
    signIn: async () => {
      const result = await promptAsync();
      if (result.type === "success") {
        const token = result.params.id_token;
        return token
          ? profileFromIdToken(token)
          : { error: "Google nie zwrócił tokenu logowania." };
      }
      if (result.type === "error")
        return {
          error: result.error?.message || "Nie udało się zalogować przez Google.",
        };
      return null;
    },
  };
}
