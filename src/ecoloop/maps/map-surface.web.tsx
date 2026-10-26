import React, { useEffect, useMemo, useRef, useState } from "react";
import { createMapDocument } from "./document";
import { createGoogleMapDocument } from "./google-document";
import {
  googleMapsApiKey,
  MapProvider,
  MapSurfaceProps,
  parseMapEvent,
} from "./types";

export default function MapSurface(props: MapSurfaceProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const [provider, setProvider] = useState<MapProvider>(
    googleMapsApiKey ? "google" : "osm",
  );
  const html = useMemo(
    () =>
      provider === "google"
        ? createGoogleMapDocument(googleMapsApiKey)
        : createMapDocument(),
    [provider],
  );
  useEffect(() => {
    latest.current.onProvider?.(provider);
  }, [provider]);
  const config = JSON.stringify(props.config);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = parseMapEvent(event.data);
      if (!message) return;
      if (message.type === "ready") {
        latest.current.onReady();
        frame.current?.contentWindow?.postMessage(
          {
            channel: "ecoloop-map-v1",
            type: "update",
            config: latest.current.config,
          },
          window.location.origin,
        );
      } else if (
        message.type === "select" &&
        latest.current.config.points.some((p) => p.id === message.id)
      )
        latest.current.onSelect(message.id);
      else if (message.type === "provider-failed") setProvider("osm");
      else if (message.type === "tiles-error") latest.current.onTileError(true);
      else if (message.type === "tiles-loaded")
        latest.current.onTileError(false);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { channel: "ecoloop-map-v1", type: "update", config: JSON.parse(config) },
      window.location.origin,
    );
  }, [config]);
  return (
    <iframe
      ref={frame}
      key={provider}
      title={provider === "google" ? "Mapa Google" : "Mapa OpenStreetMap"}
      srcDoc={html}
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => {
        props.onReady();
        frame.current?.contentWindow?.postMessage(
          { channel: "ecoloop-map-v1", type: "update", config: props.config },
          window.location.origin,
        );
      }}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
        display: "block",
        background: "#eee7dc",
      }}
    />
  );
}
