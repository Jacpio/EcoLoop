import React, { useEffect, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { createMapDocument } from "./document";
import { createGoogleMapDocument } from "./google-document";
import {
  googleMapsApiKey,
  MapProvider,
  MapSurfaceProps,
  parseMapEvent,
} from "./types";

export default function MapSurface(props: MapSurfaceProps) {
  const webview = useRef<WebView<unknown>>(null);
  const ready = useRef(false);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const [provider, setProvider] = useState<MapProvider>(
    googleMapsApiKey ? "google" : "osm",
  );
  const source = useMemo(
    () => ({
      html:
        provider === "google"
          ? createGoogleMapDocument(googleMapsApiKey)
          : createMapDocument(),
      baseUrl: "https://ecoloop.local/",
    }),
    [provider],
  );
  useEffect(() => {
    latest.current.onProvider?.(provider);
  }, [provider]);
  const config = JSON.stringify(props.config);
  useEffect(() => {
    if (ready.current)
      webview.current?.injectJavaScript(
        `window.ecoMapUpdate&&window.ecoMapUpdate(${config.replace(/</g, "\\u003c")});true;`,
      );
  }, [config]);
  return (
    <WebView<unknown>
      key={provider}
      ref={webview}
      source={source}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled={false}
      cacheEnabled
      applicationNameForUserAgent="EcoLoop/1.0"
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={(request) => {
        if (
          request.url === "about:blank" ||
          request.url === "https://ecoloop.local/" ||
          request.url.startsWith("about:srcdoc")
        )
          return true;
        if (
          request.url.startsWith("https://www.openstreetmap.org/") ||
          request.url.startsWith("https://www.google.com/") ||
          request.url.startsWith("https://maps.google.com/")
        )
          Linking.openURL(request.url).catch(() => {});
        return false;
      }}
      onError={() => props.onTileError(true)}
      onMessage={(event) => {
        let message;
        try {
          message = parseMapEvent(JSON.parse(event.nativeEvent.data));
        } catch {
          return;
        }
        if (!message) return;
        if (message.type === "ready") {
          ready.current = true;
          latest.current.onReady();
          webview.current?.injectJavaScript(
            `window.ecoMapUpdate(${JSON.stringify(latest.current.config).replace(/</g, "\\u003c")});true;`,
          );
        } else if (
          message.type === "select" &&
          latest.current.config.points.some((p) => p.id === message.id)
        )
          latest.current.onSelect(message.id);
        else if (message.type === "provider-failed") {
          ready.current = false;
          setProvider("osm");
        } else if (message.type === "tiles-error")
          latest.current.onTileError(true);
        else if (message.type === "tiles-loaded")
          latest.current.onTileError(false);
      }}
      style={{ flex: 1, backgroundColor: "#eee7dc" }}
    />
  );
}
