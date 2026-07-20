import { useEffect, useRef } from "react";
import L from "leaflet";
import { useApp } from "../store/AppStore";

const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = "©OpenStreetMap ©CARTO";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  active?: boolean;
}

export function LeafletMap({
  center,
  zoom = 12,
  markers = [],
  fitToMarkers = false,
  onMarkerClick,
  className = "",
  interactive = true
}: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  fitToMarkers?: boolean;
  onMarkerClick?: (id: string) => void;
  className?: string;
  interactive?: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const { resolvedTheme } = useApp();
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: false,
      keyboard: interactive
    });
    map.attributionControl.setPrefix(false);
    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      markerLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileRef.current?.remove();
    tileRef.current = L.tileLayer(
      resolvedTheme === "dark" ? DARK_TILES : LIGHT_TILES,
      { attribution: ATTRIBUTION, maxZoom: 19 }
    ).addTo(map);
  }, [resolvedTheme]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    markers.forEach((m) => {
      const size = m.active ? 18 : 14;
      const icon = L.divIcon({
        className: "chains-pin",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:var(--c-accent);border:2.5px solid ${
          m.active ? "var(--c-accent-hi)" : "white"
        };box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>`
      });
      const marker = L.marker([m.lat, m.lng], { icon, title: m.label });
      if (clickRef.current) {
        marker.on("click", () => clickRef.current?.(m.id));
      }
      marker.addTo(layer);
    });
    if (fitToMarkers && markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.lat, m.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    }
  }, [markers, fitToMarkers]);

  useEffect(() => {
    if (!fitToMarkers) {
      mapRef.current?.setView(center, zoom);
    }
  }, [center[0], center[1], zoom, fitToMarkers]);

  return <div ref={divRef} className={className} />;
}
