import maplibregl, { type LngLatLike, Popup } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point, Polygon } from 'geojson';
import './styles.css';
import {
  BASEMAP_STYLE,
  CONFLICT_ZONES,
  getMilitaryBaseColor,
  HOTSPOTS,
  MILITARY_BASES,
  PIPELINES,
  PIPELINE_COLORS,
  STRATEGIC_WATERWAYS,
  UNDERSEA_CABLES,
  type ConflictZone,
} from './data';

type ViewPresetKey = 'global' | 'europe' | 'middleEast' | 'indoPacific' | 'atlantic' | 'asia';
type LayerToggleKey = 'countries' | 'hotspots' | 'conflicts' | 'bases' | 'cables' | 'pipelines' | 'waterways';
type FeatureProperties = Record<string, string | number | boolean | null | undefined>;

interface StaticFeature {
  source: string;
  label: string;
  description?: string;
  location?: string;
  meta?: string;
}

interface LayerToggleConfig {
  id: LayerToggleKey;
  title: string;
  description: string;
  layerIds: string[];
  checked: boolean;
}

type BasemapLabelLanguage = 'default' | 'zh';

const app = document.querySelector('#app');

if (!(app instanceof HTMLDivElement)) {
  throw new Error('Map app root not found.');
}

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <section>
        <h1 class="headline">地球online</h1>
      </section>

      <section class="panel">
        <h2>视角预设</h2>
        <div class="preset-grid" id="preset-grid"></div>
      </section>

      <section class="panel">
        <h2>图层开关</h2>
        <div class="toggle-list" id="toggle-list"></div>
      </section>

      <section class="panel">
        <h2>图例</h2>
        <div class="legend-list">
          <div class="legend-item"><span class="legend-swatch" style="background:#74d2de"></span>热点与水道</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#ff6b6b"></span>冲突区域</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#8dd694"></span>军事基地</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#00b4d8"></span>海底电缆</div>
          <div class="legend-item"><span class="legend-swatch" style="background:#f7b267"></span>管道</div>
        </div>
      </section>
    </aside>

    <main class="map-shell">
      <div class="map-frame">
        <div id="map" class="map"></div>
      </div>
    </main>
  </div>
`;

const mapContainer = document.querySelector('#map');
const presetGrid = document.querySelector('#preset-grid');
const toggleList = document.querySelector('#toggle-list');

if (
  !(mapContainer instanceof HTMLDivElement)
  || !(presetGrid instanceof HTMLDivElement)
  || !(toggleList instanceof HTMLDivElement)
) {
  throw new Error('Map UI mount points not found.');
}

const presetGridElement: HTMLDivElement = presetGrid;
const toggleListElement: HTMLDivElement = toggleList;

const viewPresets: Record<ViewPresetKey, { label: string; center: LngLatLike; zoom: number }> = {
  global: { label: '全球', center: [12, 22], zoom: 1.55 },
  europe: { label: '欧洲', center: [18, 49], zoom: 3.2 },
  middleEast: { label: '中东', center: [46, 28], zoom: 3.3 },
  indoPacific: { label: '印太', center: [113, 12], zoom: 2.55 },
  atlantic: { label: '大西洋', center: [-28, 28], zoom: 2.3 },
  asia: { label: '亚洲', center: [96, 34], zoom: 2.6 },
};

const layerToggles: LayerToggleConfig[] = [
  { id: 'countries', title: '国家边界', description: '底图自带国家边界线', layerIds: ['boundary_country_z0-4', 'boundary_country_z5-'], checked: true },
  { id: 'hotspots', title: '热点', description: '八个核心战略观察点', layerIds: ['hotspots-circle'], checked: true },
  { id: 'conflicts', title: '冲突区', description: '六个静态冲突多边形', layerIds: ['conflicts-fill', 'conflicts-outline'], checked: true },
  { id: 'bases', title: '军事基地', description: '十二个代表性海外驻点', layerIds: ['bases-circle'], checked: true },
  { id: 'cables', title: '海底电缆', description: '六条主要海缆路线', layerIds: ['cables-line'], checked: false },
  { id: 'pipelines', title: '管道', description: '八条主要能源走廊', layerIds: ['pipelines-line'], checked: true },
  { id: 'waterways', title: '战略水道', description: '六个全球咽喉点', layerIds: ['waterways-circle', 'waterways-label'], checked: true },
];

const popup = new Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' });
const basemapLabelLanguage: BasemapLabelLanguage = 'zh';

const map = new maplibregl.Map({
  container: mapContainer,
  style: BASEMAP_STYLE,
  center: viewPresets.global.center,
  zoom: viewPresets.global.zoom,
  minZoom: 1,
  maxZoom: 7,
  attributionControl: {},
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

renderPresets();
renderToggles();

map.on('load', async () => {
  try {
    applyBasemapLabelLanguage(basemapLabelLanguage);
    addHotspotLayer();
    addConflictLayers();
    addBaseLayer();
    addCableLayer();
    addPipelineLayer();
    addWaterwayLayer();
    wireInteractions();
  } catch (error) {
    console.error('[map] Failed to initialize.', error);
  }
});

map.on('error', () => {
  console.warn('[map] Basemap error detected. External tiles may be blocked.');
});

function applyBasemapLabelLanguage(language: BasemapLabelLanguage): void {
  if (language === 'default') return;

  const style = map.getStyle();
  if (!style.layers) return;

  const styleLayers = style.layers as Array<{ id: string; type: string; layout?: Record<string, unknown> }>;

  styleLayers.forEach((layer) => {
    if (layer.type !== 'symbol') return;

    const textField = layer.layout?.['text-field'];
    if (!referencesNameField(textField)) return;

    map.setLayoutProperty(layer.id, 'text-field', buildLocalizedTextField(textField, language));
  });
}

function buildLocalizedTextField(fallbackTextField: unknown, language: Exclude<BasemapLabelLanguage, 'default'>): unknown {
  const languageFields = language === 'zh'
    ? ['name:zh-Hans', 'name:zh', 'name_zh-Hans', 'name_zh', 'name_zh_cn']
    : [];

  return ['coalesce', ...languageFields.map((field) => ['get', field]), fallbackTextField];
}

function referencesNameField(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.includes('name');
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return JSON.stringify(value).includes('name');
}

function renderPresets(): void {
  Object.entries(viewPresets).forEach(([key, preset]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-button';
    button.textContent = preset.label;
    button.dataset.preset = key;
    button.addEventListener('click', () => {
      map.flyTo({ center: preset.center, zoom: preset.zoom, essential: true, duration: 900 });
      updatePresetButtons(key as ViewPresetKey);
    });
    presetGridElement.appendChild(button);
  });

  updatePresetButtons('global');
}

function updatePresetButtons(active: ViewPresetKey): void {
  presetGridElement.querySelectorAll<HTMLButtonElement>('.preset-button').forEach((button) => {
    const isActive = button.dataset.preset === active;
    button.style.borderColor = isActive ? 'rgba(116, 210, 222, 0.75)' : 'rgba(255, 255, 255, 0.09)';
    button.style.background = isActive ? 'rgba(116, 210, 222, 0.14)' : 'rgba(255, 255, 255, 0.04)';
  });
}

function renderToggles(): void {
  layerToggles.forEach((toggle) => {
    const label = document.createElement('label');
    label.className = 'toggle-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = toggle.checked;
    input.dataset.toggleId = toggle.id;
    input.addEventListener('change', () => {
      toggle.layerIds.forEach((layerId) => {
        if (!map.getLayer(layerId)) return;
        map.setLayoutProperty(layerId, 'visibility', input.checked ? 'visible' : 'none');
      });
    });

    const copy = document.createElement('div');
    copy.className = 'toggle-copy';
    copy.innerHTML = `<strong>${toggle.title}</strong><span>${toggle.description}</span>`;

    label.append(input, copy);
    toggleListElement.appendChild(label);
  });
}

function addHotspotLayer(): void {
  map.addSource('hotspots', {
    type: 'geojson',
    data: asPointCollection(HOTSPOTS, (hotspot) => ({
      source: 'Hotspot',
      label: hotspot.name,
      description: hotspot.description,
      location: hotspot.location,
      meta: hotspot.subtext,
    })),
  });

  map.addLayer({
    id: 'hotspots-circle',
    type: 'circle',
    source: 'hotspots',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 4, 4, 7],
      'circle-color': '#74d2de',
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#081018',
      'circle-opacity': 0.92,
    },
  });
}

function addConflictLayers(): void {
  map.addSource('conflicts', {
    type: 'geojson',
    data: asPolygonCollection(CONFLICT_ZONES, (zone) => ({
      source: 'Conflict zone',
      label: zone.name,
      description: zone.description,
      location: zone.location,
      meta: zone.parties?.join(' / '),
    })),
  });

  map.addLayer({
    id: 'conflicts-fill',
    type: 'fill',
    source: 'conflicts',
    paint: { 'fill-color': ['match', ['get', 'intensity'], 'high', '#ff6b6b', 'medium', '#f7b267', '#ffd166'], 'fill-opacity': 0.18 },
  });

  map.addLayer({
    id: 'conflicts-outline',
    type: 'line',
    source: 'conflicts',
    paint: { 'line-color': '#ff8c8c', 'line-width': 1.3, 'line-opacity': 0.8 },
  });
}

function addBaseLayer(): void {
  map.addSource('bases', {
    type: 'geojson',
    data: asPointCollection(MILITARY_BASES, (base) => ({
      source: 'Military base',
      label: base.name,
      description: base.description,
      location: base.country,
      meta: base.arm,
      color: getMilitaryBaseColor(base.type, 1),
    })),
  });

  map.addLayer({
    id: 'bases-circle',
    type: 'circle',
    source: 'bases',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3, 5, 6],
      'circle-color': ['coalesce', ['get', 'color'], '#8dd694'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#051019',
      'circle-opacity': 0.95,
    },
  });
}

function addCableLayer(): void {
  map.addSource('cables', {
    type: 'geojson',
    data: asLineCollection(UNDERSEA_CABLES, (cable) => ({
      source: 'Undersea cable',
      label: cable.name,
      description: cable.description,
      meta: [cable.owner, cable.year ? `RFS ${cable.year}` : ''].filter(Boolean).join(' • '),
    })),
  });

  map.addLayer({
    id: 'cables-line',
    type: 'line',
    source: 'cables',
    layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
    paint: { 'line-color': '#00b4d8', 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1.1, 5, 3], 'line-opacity': 0.75 },
  });
}

function addPipelineLayer(): void {
  map.addSource('pipelines', {
    type: 'geojson',
    data: asLineCollection(PIPELINES, (pipeline) => ({
      source: 'Pipeline',
      label: pipeline.name,
      description: pipeline.operator ? `Operator: ${pipeline.operator}` : undefined,
      meta: [pipeline.type, pipeline.capacity].filter(Boolean).join(' • '),
      lineColor: PIPELINE_COLORS[pipeline.type],
    })),
  });

  map.addLayer({
    id: 'pipelines-line',
    type: 'line',
    source: 'pipelines',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': ['coalesce', ['get', 'lineColor'], '#f7b267'], 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1, 5, 2.6], 'line-opacity': 0.68 },
  });
}

function addWaterwayLayer(): void {
  map.addSource('waterways', {
    type: 'geojson',
    data: asPointCollection(STRATEGIC_WATERWAYS, (waterway) => ({
      source: 'Strategic waterway',
      label: waterway.name,
      description: waterway.description,
    })),
  });

  map.addLayer({
    id: 'waterways-circle',
    type: 'circle',
    source: 'waterways',
    paint: { 'circle-radius': 4, 'circle-color': '#90e0ef', 'circle-stroke-width': 1, 'circle-stroke-color': '#081018', 'circle-opacity': 0.88 },
  });

  map.addLayer({
    id: 'waterways-label',
    type: 'symbol',
    source: 'waterways',
    minzoom: 2.4,
    layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.1], 'text-anchor': 'top' },
    paint: { 'text-color': '#dceffd', 'text-halo-color': '#081018', 'text-halo-width': 1 },
  });
}

function wireInteractions(): void {
  const interactiveLayers = ['hotspots-circle', 'conflicts-fill', 'bases-circle', 'cables-line', 'pipelines-line', 'waterways-circle'];

  interactiveLayers.forEach((layerId) => {
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  });

  map.on('click', (event) => {
    const feature = map.queryRenderedFeatures(event.point, { layers: interactiveLayers })[0];
    if (!feature) {
      popup.remove();
      return;
    }

    const properties = feature.properties as FeatureProperties | undefined;
    popup.setLngLat(event.lngLat).setHTML(buildPopupContent(feature.layer.id, properties)).addTo(map);
  });
}

function buildPopupContent(layerId: string, properties?: FeatureProperties): string {
  if (layerId === 'country-fill') {
    const title = valueAsString(properties?.name ?? properties?.NAME ?? properties?.admin) ?? 'Country';
    const code = valueAsString(properties?.['ISO3166-1-Alpha-2'] ?? properties?.ISO_A2 ?? properties?.iso_a2);
    return `
      <p class="popup-kicker">国家</p>
      <h3 class="popup-title">${escapeHtml(title)}</h3>
      <p class="popup-copy">来自本地国家 GeoJSON 的政治边界。</p>
      ${code ? `<p class="popup-meta">ISO2：${escapeHtml(code)}</p>` : ''}
    `;
  }

  const label = valueAsString(properties?.label) ?? '地图要素';
  const source = valueAsString(properties?.source) ?? '地图图层';
  const description = valueAsString(properties?.description);
  const location = valueAsString(properties?.location);
  const meta = valueAsString(properties?.meta);

  return `
    <p class="popup-kicker">${escapeHtml(source)}</p>
    <h3 class="popup-title">${escapeHtml(label)}</h3>
    ${description ? `<p class="popup-copy">${escapeHtml(description)}</p>` : ''}
    ${location ? `<p class="popup-meta">位置：${escapeHtml(location)}</p>` : ''}
    ${meta ? `<p class="popup-meta">${escapeHtml(meta)}</p>` : ''}
  `;
}

function asPointCollection<T extends { lat: number; lon: number }>(items: T[], getProperties: (item: T) => StaticFeature & FeatureProperties): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: items.map((item) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [item.lon, item.lat] }, properties: getProperties(item) })),
  };
}

function asLineCollection<T extends { points: [number, number][] }>(items: T[], getProperties: (item: T) => StaticFeature & FeatureProperties): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: items.filter((item) => item.points.length >= 2).map((item) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: item.points }, properties: getProperties(item) })),
  };
}

function asPolygonCollection(items: ConflictZone[], getProperties: (item: ConflictZone) => StaticFeature & FeatureProperties): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: items.filter((item) => item.coords.length >= 3).map((item) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [closeRing(item.coords)] },
      properties: { intensity: item.intensity, ...getProperties(item) },
    })),
  };
}

function closeRing(points: [number, number][]): [number, number][] {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return points;
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

function valueAsString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}