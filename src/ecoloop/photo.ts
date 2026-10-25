import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

/**
 * Lets the user pick one image and returns a value usable as an <Image> uri,
 * or undefined when the picker is cancelled.
 *
 * The whole demo state is persisted as one AsyncStorage value, so embedding a
 * base64 photo there can exceed the Android per-row limit (~2 MB). Native
 * therefore keeps the picker's file uri. On the web the picker returns a
 * temporary blob: URL that dies on refresh, so the image is embedded as a
 * (JPEG, per the Expo docs) data URI instead.
 */
export async function pickPhoto(quality = 0.7) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality,
    base64: Platform.OS === "web",
  });
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return undefined;
  return asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
}
