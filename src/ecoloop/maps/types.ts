import type { PointCategory } from "../domain";
export type MapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: PointCategory;
  type: string;
  status: string;
};
export type MapFocus = { latitude: number; longitude: number; key: string };
export type MapConfig = {
  points: MapPoint[];
  selected: string;
  rightInset: number;
  focus?: MapFocus;
};
export type MapEvent =
  | { channel: "ecoloop-map-v1"; type: "select"; id: string }
  | {
      channel: "ecoloop-map-v1";
      type: "ready" | "tiles-error" | "tiles-loaded" | "provider-failed";
    };
export type MapProvider = "google" | "osm";
export const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export type MapSurfaceProps = {
  config: MapConfig;
  onSelect: (id: string) => void;
  onReady: () => void;
  onTileError: (failed: boolean) => void;
  onProvider?: (provider: MapProvider) => void;
};
export function parseMapEvent(value: unknown): MapEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;
  if (event.channel !== "ecoloop-map-v1") return null;
  if (event.type === "select" && typeof event.id === "string")
    return { channel: event.channel, type: "select", id: event.id };
  if (
    event.type === "ready" ||
    event.type === "tiles-error" ||
    event.type === "tiles-loaded" ||
    event.type === "provider-failed"
  )
    return { channel: event.channel, type: event.type };
  return null;
}
