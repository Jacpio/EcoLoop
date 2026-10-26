// OAuth client IDs are public identifiers, not secrets.
export const googleWebClientId =
  "324741859307-8nifpftb52bfi9qc1oe8aeq2qbf3bisj.apps.googleusercontent.com";
export const googleIosClientId =
  "324741859307-269mbpv2sacju65s35q0568ku9gjkvlb.apps.googleusercontent.com";
export type GoogleProfile = { name: string; email: string };
// Result of a sign-in attempt: a profile, null when the user cancelled,
// or an error message ready to show.
export type GoogleResult = GoogleProfile | null | { error: string };
export type GoogleSignIn = {
  available: boolean;
  signIn: () => Promise<GoogleResult>;
};
