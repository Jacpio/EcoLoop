import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

const MAX_SIDE = 1024;

/**
 * Lets the user pick one image and returns a value usable as an <Image> uri,
 * or undefined when the picker is cancelled.
 *
 * The whole demo state is persisted as one storage value (AsyncStorage on
 * native, localStorage with ~5 MB on the web), so a full-size photo embedded
 * there would make every later save fail. Native therefore keeps the picker's
 * file uri. On the web the picked blob: URL dies on refresh, so the photo is
 * shrunk to at most 1024 px and stored as a small JPEG data URI instead.
 */
export async function pickPhoto(quality = 0.7) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality,
  });
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return undefined;
  return Platform.OS === "web"
    ? shrinkForStorage(asset.uri, quality)
    : asset.uri;
}

async function shrinkForStorage(uri: string, quality: number) {
  const image = new window.Image();
  image.src = uri;
  await image.decode();
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return uri;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
