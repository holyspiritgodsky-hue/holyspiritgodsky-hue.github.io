(function attachLevel05Scene() {
    const RENDER_MODE = 'level0_5';
    let mapRect = null;
    let mapClipRect = null;
    let endTurnRect = null;

    const LEVEL05_FACTION_ORDER = ['us', 'ru', 'cn', 'eu'];
    const LEVEL05_LAYOUT_VERSION = 4;
    const LEVEL05_GEOJSON_URL = 'data/countries.geo.json';
    const LEVEL05_MINOR_FACTIONS = ['in', 'jp', 'ir', 'tw', 've', 'ua', 'br', 'eg', 'sa', 'pa', 'mx', 'ca', 'il', 'iq'];
    const LEVEL05_VALID_OWNERS = ['us', 'ru', 'cn', 'eu', 'none'].concat(LEVEL05_MINOR_FACTIONS);
    // Keep 1:1 map coverage so regions tile seamlessly without visible gaps.
    const LEVEL05_REGION_GLOBAL_SCALE = 1;
    const LEVEL05_REGION_FOCUS = { x: 0.5, y: 0.5 };
    const LEVEL05_REGION_INSET_SCALE = 1;
    const LEVEL05_REGION_OFFSET = { x: -0.03, y: 0.08 };
    const LEVEL05_MINOR_MIN_AREA = 0.010;
    const LEVEL05_MINOR_MAX_AREA = 0.030;
    const LEVEL05_OCEAN_MAX_AREA = 0.130;
    const LEVEL05_REGION_TOP_SAFE = 0;
    const LEVEL05_REGION_BOTTOM_SAFE = 0;
    const LEVEL05_FACTION_COLOR = {
        us: 'rgba(59,130,246,0.40)',
        ru: 'rgba(239,68,68,0.40)',
        cn: 'rgba(245,158,11,0.40)',
        eu: 'rgba(168,85,247,0.40)',
        in: 'rgba(244,114,182,0.34)',
        jp: 'rgba(248,113,113,0.34)',
        ir: 'rgba(20,184,166,0.34)',
        tw: 'rgba(251,146,60,0.34)',
        ve: 'rgba(250,204,21,0.34)',
        ua: 'rgba(56,189,248,0.34)',
        br: 'rgba(74,222,128,0.34)',
        eg: 'rgba(251,191,36,0.34)',
        sa: 'rgba(163,230,53,0.34)',
        pa: 'rgba(248,113,113,0.34)',
        mx: 'rgba(110,231,183,0.34)',
        ca: 'rgba(252,165,165,0.34)',
        il: 'rgba(147,197,253,0.34)',
        iq: 'rgba(134,239,172,0.34)',
        none: 'rgba(15,23,42,0.10)'
    };
    const LEVEL05_REGION_BLUEPRINT = [
        { id: 'na_w', owner: 'us', adj: ['na_e', 'pac', 'ca', 'mx', 'pac_w'], seed: [0.12, 0.31], weight: 0.056 },
        { id: 'na_e', owner: 'us', adj: ['na_w', 'atl', 'eu_w', 've', 'ca', 'mx', 'atl_o'], seed: [0.26, 0.31], weight: 0.054 },
        { id: 'pac', owner: 'us', adj: ['na_w', 'cn_s', 'sea', 've', 'mx', 'pa', 'pac_w', 'pac_e'], seed: [0.24, 0.56], weight: 0.056 },
        { id: 'atl', owner: 'eu', adj: ['na_e', 'eu_w', 'af_n', 've', 'br', 'pa', 'atl_o'], seed: [0.41, 0.36], weight: 0.050 },
        { id: 'eu_w', owner: 'eu', adj: ['atl', 'eu_e', 'ru_w', 'af_n', 'eg', 'atl_o'], seed: [0.51, 0.31], weight: 0.048 },
        { id: 'eu_e', owner: 'eu', adj: ['eu_w', 'ru_w', 'ru_e', 'me', 'ua', 'ir'], seed: [0.61, 0.31], weight: 0.048 },
        { id: 'ru_w', owner: 'ru', adj: ['eu_w', 'eu_e', 'ru_e', 'ua', 'ir'], seed: [0.69, 0.21], weight: 0.056 },
        { id: 'ru_e', owner: 'ru', adj: ['ru_w', 'cn_n', 'cn_s', 'ua', 'jp', 'pac_e'], seed: [0.83, 0.24], weight: 0.058 },
        { id: 'cn_n', owner: 'cn', adj: ['ru_e', 'cn_s', 'me', 'jp', 'in', 'ir', 'sa', 'tw'], seed: [0.73, 0.43], weight: 0.052 },
        { id: 'cn_s', owner: 'cn', adj: ['cn_n', 'sea', 'pac', 'ru_e', 'in', 'tw', 'jp', 'pac_e'], seed: [0.71, 0.58], weight: 0.052 },
        { id: 'me', owner: 'ru', adj: ['eu_e', 'cn_n', 'af_n', 'af_s', 'ir', 'eg', 'sa', 'in', 'il', 'iq', 'ind_o'], seed: [0.58, 0.45], weight: 0.046 },
        { id: 'af_n', owner: 'eu', adj: ['atl', 'eu_w', 'me', 'af_s', 'eg', 'br', 'atl_o'], seed: [0.46, 0.50], weight: 0.048 },
        { id: 'af_s', owner: 'cn', adj: ['af_n', 'me', 'sea', 'sa', 'eg', 'br', 'ind_o'], seed: [0.52, 0.67], weight: 0.050 },
        { id: 'sea', owner: 'cn', adj: ['cn_s', 'af_s', 'pac', 'in', 'tw', 'pac_w', 'pac_e', 'ind_o'], seed: [0.61, 0.74], weight: 0.048 },
        { id: 've', owner: 've', adj: ['na_e', 'atl', 'pac', 'br', 'mx', 'pa', 'atl_o'], seed: [0.30, 0.49], weight: 0.040 },
        { id: 'br', owner: 'br', adj: ['ve', 'atl', 'af_n', 'af_s', 'atl_o'], seed: [0.36, 0.68], weight: 0.041 },
        { id: 'ua', owner: 'ua', adj: ['eu_e', 'ru_w', 'ru_e', 'ir'], seed: [0.66, 0.29], weight: 0.040 },
        { id: 'ir', owner: 'ir', adj: ['ua', 'eu_e', 'ru_w', 'me', 'cn_n', 'sa', 'iq', 'il'], seed: [0.60, 0.41], weight: 0.040 },
        { id: 'eg', owner: 'eg', adj: ['eu_w', 'af_n', 'af_s', 'me', 'sa', 'il'], seed: [0.49, 0.55], weight: 0.040 },
        { id: 'sa', owner: 'sa', adj: ['eg', 'me', 'af_s', 'cn_n', 'in', 'ir', 'iq', 'il', 'ind_o'], seed: [0.59, 0.58], weight: 0.040 },
        { id: 'in', owner: 'in', adj: ['sa', 'me', 'cn_n', 'cn_s', 'sea', 'tw', 'ind_o'], seed: [0.67, 0.64], weight: 0.041 },
        { id: 'tw', owner: 'tw', adj: ['cn_s', 'cn_n', 'sea', 'jp', 'in'], seed: [0.77, 0.56], weight: 0.038 },
        { id: 'jp', owner: 'jp', adj: ['ru_e', 'cn_n', 'cn_s', 'tw', 'pac_e'], seed: [0.89, 0.46], weight: 0.041 },
        { id: 'ca', owner: 'ca', adj: ['na_w', 'na_e', 'mx'], seed: [0.19, 0.20], weight: 0.041 },
        { id: 'mx', owner: 'mx', adj: ['na_w', 'na_e', 'pac', 've', 'pa', 'ca', 'pac_w'], seed: [0.22, 0.44], weight: 0.041 },
        { id: 'pa', owner: 'pa', adj: ['mx', 've', 'atl', 'pac'], seed: [0.30, 0.53], weight: 0.038 },
        { id: 'il', owner: 'il', adj: ['eg', 'sa', 'ir', 'iq', 'me'], seed: [0.56, 0.48], weight: 0.038 },
        { id: 'iq', owner: 'iq', adj: ['il', 'ir', 'sa', 'me', 'cn_n'], seed: [0.62, 0.49], weight: 0.039 },
        { id: 'pac_w', owner: 'none', adj: ['na_w', 'mx', 'pac', 'sea', 'pac_e'], seed: [0.02, 0.56], weight: 0.030 },
        { id: 'pac_e', owner: 'none', adj: ['ru_e', 'jp', 'cn_s', 'sea', 'pac', 'pac_w'], seed: [0.98, 0.56], weight: 0.030 },
        { id: 'atl_o', owner: 'none', adj: ['na_e', 'atl', 'eu_w', 'af_n', 've', 'br'], seed: [0.39, 0.44], weight: 0.028 },
        { id: 'ind_o', owner: 'none', adj: ['sa', 'in', 'sea', 'af_s', 'me'], seed: [0.64, 0.71], weight: 0.026 }
    ];
    const LEVEL05_GEO_TARGETS = [
        { id: 'us', owner: 'us', name: 'United States of America' },
        { id: 'ru', owner: 'ru', name: 'Russia' },
        { id: 'cn', owner: 'cn', name: 'China' },
        { id: 'in', owner: 'in', name: 'India' },
        { id: 'jp', owner: 'jp', name: 'Japan' },
        { id: 'ir', owner: 'ir', name: 'Iran' },
        { id: 'tw', owner: 'tw', name: 'Taiwan' },
        { id: 've', owner: 've', name: 'Venezuela' },
        { id: 'ua', owner: 'ua', name: 'Ukraine' },
        { id: 'br', owner: 'br', name: 'Brazil' },
        { id: 'eg', owner: 'eg', name: 'Egypt' },
        { id: 'sa', owner: 'sa', name: 'Saudi Arabia' },
        { id: 'pa', owner: 'pa', name: 'Panama' },
        { id: 'mx', owner: 'mx', name: 'Mexico' },
        { id: 'ca', owner: 'ca', name: 'Canada' },
        { id: 'il', owner: 'il', name: 'Israel' },
        { id: 'iq', owner: 'iq', name: 'Iraq' },
        { id: 'eu_fr', owner: 'eu', name: 'France' },
        { id: 'eu_de', owner: 'eu', name: 'Germany' },
        { id: 'eu_it', owner: 'eu', name: 'Italy' },
        { id: 'eu_es', owner: 'eu', name: 'Spain' },
        { id: 'eu_pl', owner: 'eu', name: 'Poland' }
    ];
    let LEVEL05_REGION_LAYOUT = Array.isArray(window.__LEVEL05_GEO_LAYOUT_PRESET)
        ? window.__LEVEL05_GEO_LAYOUT_PRESET.map(item => ({
            id: item.id,
            owner: item.owner,
            adj: Array.isArray(item.adj) ? item.adj.slice() : [],
            poly: Array.isArray(item.poly) ? item.poly.map(p => [Number(p[0]) || 0, Number(p[1]) || 0]) : []
        }))
        : buildRegionLayoutFromSeeds(LEVEL05_REGION_BLUEPRINT);
    const LEVEL05_START_OWNER = {
        na_e: 'us',
        ru_w: 'ru',
        cn_n: 'cn',
        eu_w: 'eu',
        in: 'in',
        jp: 'jp',
        ir: 'ir',
        tw: 'tw',
        ve: 've',
        ua: 'ua',
        br: 'br',
        eg: 'eg',
        sa: 'sa',
        pa: 'pa',
        mx: 'mx',
        ca: 'ca',
        il: 'il',
        iq: 'iq',
        us: 'us',
        ru: 'ru',
        cn: 'cn',
        eu_fr: 'eu',
        eu_de: 'eu',
        eu_it: 'eu',
        eu_es: 'eu',
        eu_pl: 'eu'
    };

    function isMinorFaction(faction) {
        return LEVEL05_MINOR_FACTIONS.includes(faction);
    }

    function buildInitialRegionState(regionId, fallbackOwner) {
        const owner = LEVEL05_START_OWNER[regionId] || fallbackOwner || 'none';
        const minor = isMinorFaction(owner);
        return {
            owner,
            control: owner === 'none' ? (18 + Math.random() * 14) : (minor ? (46 + Math.random() * 20) : (72 + Math.random() * 20)),
            supply: owner === 'none' ? (24 + Math.random() * 18) : (minor ? (38 + Math.random() * 20) : (65 + Math.random() * 28)),
            troops: owner === 'none' ? 0 : (minor ? (3 + ((Math.random() * 4) | 0)) : (9 + ((Math.random() * 4) | 0))),
            ap: owner === 'none' || minor ? 0 : 2
        };
    }

    function buildInitialRegionMap() {
        const regions = {};
        LEVEL05_REGION_LAYOUT.forEach(item => {
            regions[item.id] = buildInitialRegionState(item.id, item.owner);
        });
        return regions;
    }

    function normalizeCountryName(name) {
        return String(name || '').trim().toLowerCase();
    }

    function projectLonLatToNormalized(lon, lat) {
        const x = Math.max(0, Math.min(1, (Number(lon) + 180) / 360));
        const y = Math.max(0, Math.min(1, (90 - Number(lat)) / 180));
        return [x, y];
    }

    function simplifyRing(ring, maxPoints) {
        if (!Array.isArray(ring) || ring.length <= maxPoints) return ring || [];
        const out = [];
        const step = Math.max(1, Math.ceil(ring.length / maxPoints));
        for (let i = 0; i < ring.length; i += step) out.push(ring[i]);
        if (out.length < 3) return ring;
        return out;
    }

    function getLargestProjectedRing(geometry) {
        if (!geometry || !geometry.type || !Array.isArray(geometry.coordinates)) return null;
        const candidateRings = [];
        if (geometry.type === 'Polygon') {
            if (Array.isArray(geometry.coordinates[0])) candidateRings.push(geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(poly => {
                if (Array.isArray(poly) && Array.isArray(poly[0])) candidateRings.push(poly[0]);
            });
        }
        if (!candidateRings.length) return null;
        let best = null;
        let bestArea = -1;
        candidateRings.forEach(ring => {
            const projected = (ring || []).map(p => projectLonLatToNormalized(p[0], p[1]));
            const reduced = simplifyRing(projected, 220);
            const area = polygonArea(reduced);
            if (area > bestArea) {
                best = reduced;
                bestArea = area;
            }
        });
        return best;
    }

    function getPolyBounds(poly) {
        if (!Array.isArray(poly) || !poly.length) return null;
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        poly.forEach(p => {
            const x = Number(p[0]) || 0;
            const y = Number(p[1]) || 0;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        return { minX, maxX, minY, maxY };
    }

    function boxesNearby(a, b, pad) {
        return !(a.maxX + pad < b.minX || b.maxX + pad < a.minX || a.maxY + pad < b.minY || b.maxY + pad < a.minY);
    }

    function orientation(ax, ay, bx, by, cx, cy) {
        const v = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        if (Math.abs(v) < 1e-9) return 0;
        return v > 0 ? 1 : -1;
    }

    function segmentsIntersect(a, b, c, d) {
        const o1 = orientation(a[0], a[1], b[0], b[1], c[0], c[1]);
        const o2 = orientation(a[0], a[1], b[0], b[1], d[0], d[1]);
        const o3 = orientation(c[0], c[1], d[0], d[1], a[0], a[1]);
        const o4 = orientation(c[0], c[1], d[0], d[1], b[0], b[1]);
        return o1 !== o2 && o3 !== o4;
    }

    function sqDistPointToSegment(p, a, b) {
        const vx = b[0] - a[0];
        const vy = b[1] - a[1];
        const wx = p[0] - a[0];
        const wy = p[1] - a[1];
        const c1 = vx * wx + vy * wy;
        if (c1 <= 0) {
            const dx = p[0] - a[0];
            const dy = p[1] - a[1];
            return dx * dx + dy * dy;
        }
        const c2 = vx * vx + vy * vy;
        if (c2 <= c1) {
            const dx = p[0] - b[0];
            const dy = p[1] - b[1];
            return dx * dx + dy * dy;
        }
        const t = c1 / c2;
        const px = a[0] + vx * t;
        const py = a[1] + vy * t;
        const dx = p[0] - px;
        const dy = p[1] - py;
        return dx * dx + dy * dy;
    }

    function polyNearOrTouch(polyA, polyB, threshold) {
        if (!Array.isArray(polyA) || !Array.isArray(polyB) || polyA.length < 3 || polyB.length < 3) return false;
        for (let i = 0; i < polyA.length; i++) {
            const a1 = polyA[i];
            const a2 = polyA[(i + 1) % polyA.length];
            for (let j = 0; j < polyB.length; j++) {
                const b1 = polyB[j];
                const b2 = polyB[(j + 1) % polyB.length];
                if (segmentsIntersect(a1, a2, b1, b2)) return true;
            }
        }
        const t2 = threshold * threshold;
        for (let i = 0; i < polyA.length; i++) {
            const p = polyA[i];
            for (let j = 0; j < polyB.length; j++) {
                const b1 = polyB[j];
                const b2 = polyB[(j + 1) % polyB.length];
                if (sqDistPointToSegment(p, b1, b2) <= t2) return true;
            }
        }
        return false;
    }

    function buildAdjacencyForLayout(layout) {
        const pad = 0.012;
        const near = 0.008;
        layout.forEach(item => { item.adj = []; item._bbox = getPolyBounds(item.poly); });
        for (let i = 0; i < layout.length; i++) {
            for (let j = i + 1; j < layout.length; j++) {
                const a = layout[i];
                const b = layout[j];
                if (!a._bbox || !b._bbox) continue;
                if (!boxesNearby(a._bbox, b._bbox, pad)) continue;
                if (polyNearOrTouch(a.poly, b.poly, near)) {
                    a.adj.push(b.id);
                    b.adj.push(a.id);
                }
            }
        }
        layout.forEach(item => { delete item._bbox; });
        return layout;
    }

    function buildRegionLayoutFromGeoJson(geojson) {
        if (!geojson || !Array.isArray(geojson.features)) return [];
        const featureByName = {};
        geojson.features.forEach(f => {
            const n = normalizeCountryName(f?.properties?.name);
            if (n) featureByName[n] = f;
        });

        const layout = [];
        LEVEL05_GEO_TARGETS.forEach(target => {
            const feature = featureByName[normalizeCountryName(target.name)];
            if (!feature) return;
            const ring = getLargestProjectedRing(feature.geometry);
            if (!Array.isArray(ring) || ring.length < 3) return;
            layout.push({
                id: target.id,
                owner: target.owner,
                adj: [],
                poly: ring
            });
        });
        if (layout.length < 10) return [];
        return buildAdjacencyForLayout(layout);
    }

    async function tryLoadGeoJsonLayout() {
        try {
            const res = await fetch(LEVEL05_GEOJSON_URL, { cache: 'no-store' });
            if (!res.ok) return;
            const geojson = await res.json();
            const geoLayout = buildRegionLayoutFromGeoJson(geojson);
            if (!Array.isArray(geoLayout) || geoLayout.length < 10) return;
            LEVEL05_REGION_LAYOUT = geoLayout;
            if (window.game && window.game.level05War) {
                window.game.level05War.layoutVersion = 0;
            }
        } catch (_) {}
    }

    function polygonArea(poly) {
        if (!Array.isArray(poly) || poly.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < poly.length; i++) {
            const p1 = poly[i];
            const p2 = poly[(i + 1) % poly.length];
            area += (Number(p1[0]) || 0) * (Number(p2[1]) || 0) - (Number(p2[0]) || 0) * (Number(p1[1]) || 0);
        }
        return Math.abs(area) * 0.5;
    }

    function clampWeight(w, owner) {
        const ww = Number(w) || 0;
        if (owner === 'none') return Math.max(0.008, Math.min(0.07, ww));
        if (isMinorFaction(owner)) return Math.max(0.018, Math.min(0.07, ww));
        return Math.max(0.03, Math.min(0.08, ww));
    }

    function buildRegionLayoutRaw(blueprint) {
        if (!Array.isArray(blueprint)) return [];
        return blueprint.map((item, i) => ({
            id: item.id,
            owner: item.owner,
            adj: Array.isArray(item.adj) ? item.adj.slice() : [],
            poly: buildVoronoiCell(blueprint, i)
        }));
    }

    function buildRegionLayoutFromSeeds(blueprint) {
        if (!Array.isArray(blueprint)) return [];
        const tuned = blueprint.map(item => ({
            ...item,
            weight: clampWeight(item.weight, item.owner)
        }));

        let layout = buildRegionLayoutRaw(tuned);
        for (let iter = 0; iter < 18; iter++) {
            let changed = false;
            const areaMap = {};
            layout.forEach(item => {
                areaMap[item.id] = polygonArea(item.poly);
            });

            tuned.forEach(item => {
                const owner = item.owner;
                const area = areaMap[item.id] || 0;
                if (isMinorFaction(owner)) {
                    if (area < LEVEL05_MINOR_MIN_AREA) {
                        item.weight = clampWeight((Number(item.weight) || 0) + 0.004, owner);
                        changed = true;
                    } else if (area > LEVEL05_MINOR_MAX_AREA) {
                        item.weight = clampWeight((Number(item.weight) || 0) - 0.002, owner);
                        changed = true;
                    }
                } else if (owner === 'none') {
                    if (area > LEVEL05_OCEAN_MAX_AREA) {
                        item.weight = clampWeight((Number(item.weight) || 0) - 0.0025, owner);
                        changed = true;
                    }
                }
            });

            if (!changed) break;
            layout = buildRegionLayoutRaw(tuned);
        }
        return layout;
    }

    function buildVoronoiCell(blueprint, index) {
        const site = blueprint[index]?.seed || [0.5, 0.5];
        let cell = [[0, 0], [1, 0], [1, 1], [0, 1]];
        for (let j = 0; j < blueprint.length; j++) {
            if (j === index) continue;
            const other = blueprint[j]?.seed;
            if (!Array.isArray(other)) continue;
            const a = 2 * ((other[0] || 0) - (site[0] || 0));
            const b = 2 * ((other[1] || 0) - (site[1] || 0));
            const siteW = Number(blueprint[index]?.weight) || 0;
            const otherW = Number(blueprint[j]?.weight) || 0;
            const c = (other[0] || 0) * (other[0] || 0)
                + (other[1] || 0) * (other[1] || 0)
                - otherW
                - (site[0] || 0) * (site[0] || 0)
                - (site[1] || 0) * (site[1] || 0)
                + siteW;
            cell = clipPolyHalfPlane(cell, a, b, c);
            if (!cell.length) break;
        }
        return cell;
    }

    function clipPolyHalfPlane(poly, a, b, c) {
        const eps = 1e-9;
        const inside = p => (a * p[0] + b * p[1]) <= c + eps;
        const intersect = (p1, p2) => {
            const v1 = a * p1[0] + b * p1[1] - c;
            const v2 = a * p2[0] + b * p2[1] - c;
            const t = v1 / (v1 - v2 || eps);
            return [
                p1[0] + (p2[0] - p1[0]) * t,
                p1[1] + (p2[1] - p1[1]) * t
            ];
        };

        const out = [];
        for (let i = 0; i < poly.length; i++) {
            const cur = poly[i];
            const prev = poly[(i + poly.length - 1) % poly.length];
            const curIn = inside(cur);
            const prevIn = inside(prev);
            if (curIn) {
                if (!prevIn) out.push(intersect(prev, cur));
                out.push(cur);
            } else if (prevIn) {
                out.push(intersect(prev, cur));
            }
        }
        return out;
    }

    function isRenderMode(mode) {
        return mode === RENDER_MODE;
    }

    function resetFrameState() {
        mapRect = null;
        mapClipRect = null;
        endTurnRect = null;
    }

    function getFactionPowerScale(faction) {
        if (faction === 'us') return 1.06;
        if (faction === 'ru') return 1.02;
        if (faction === 'cn') return 1.08;
        if (faction === 'eu') return 1.00;
        if (isMinorFaction(faction)) return 0.86;
        return 1;
    }

    function getPlayerFactionFromGameCountry(fallback = 'cn') {
        const country = String(window?.game?.country || '').toLowerCase();
        const map = {
            usa: 'us',
            us: 'us',
            china: 'cn',
            cn: 'cn',
            eu: 'eu',
            russia: 'ru',
            ru: 'ru'
        };
        return map[country] || fallback;
    }

    function ensureWarState() {
        if (!window.game) return null;
        const prevWar = window.game.level05War;
        const shouldRebuild = !prevWar
            || !prevWar.regions
            || Number(prevWar.layoutVersion || 0) !== LEVEL05_LAYOUT_VERSION
            || Number(prevWar.layoutRegionCount || 0) !== LEVEL05_REGION_LAYOUT.length;
        if (shouldRebuild) {
            window.game.level05War = {
                playerFaction: (prevWar && prevWar.playerFaction) || 'cn',
                turn: 1,
                phase: 'player',
                selectedRegionId: null,
                lastActionAt: 0,
                hoverRegionId: null,
                hoverEndTurn: false,
                attackFx: [],
                regions: buildInitialRegionMap(),
                layoutVersion: LEVEL05_LAYOUT_VERSION,
                layoutRegionCount: LEVEL05_REGION_LAYOUT.length
            };
        }
        const war = window.game.level05War;
        const desiredFaction = getPlayerFactionFromGameCountry((prevWar && prevWar.playerFaction) || 'cn');
        war.playerFaction = desiredFaction;
        war.layoutVersion = LEVEL05_LAYOUT_VERSION;
        war.layoutRegionCount = LEVEL05_REGION_LAYOUT.length;
        // Backfill newly added regions for old saves so minor countries/oceans always render.
        if (!war.regions || typeof war.regions !== 'object') war.regions = {};
        LEVEL05_REGION_LAYOUT.forEach(item => {
            if (war.regions[item.id]) return;
            war.regions[item.id] = buildInitialRegionState(item.id, item.owner);
        });
        war.phase = war.phase === 'ai' ? 'ai' : 'player';
        war.turn = Math.max(1, Number(war.turn) || 1);
        war.selectedRegionId = typeof war.selectedRegionId === 'string' ? war.selectedRegionId : null;
        war.hoverEndTurn = !!war.hoverEndTurn;
        war.attackFx = Array.isArray(war.attackFx) ? war.attackFx : [];
        LEVEL05_REGION_LAYOUT.forEach(item => {
            const s = war.regions[item.id];
            if (!s) return;
            s.owner = LEVEL05_VALID_OWNERS.includes(s.owner) ? s.owner : (LEVEL05_START_OWNER[item.id] || 'none');
            s.control = Math.max(1, Math.min(100, Number(s.control) || 60));
            s.supply = Math.max(1, Math.min(100, Number(s.supply) || 60));
            const troopsFloor = s.owner === 'none' ? 0 : 1;
            const cap = isMinorFaction(s.owner) ? 12 : 40;
            s.troops = Math.max(troopsFloor, Math.min(cap, Math.floor(Number(s.troops) || 0)));
            s.ap = Math.max(0, Math.min(4, Math.floor(Number(s.ap) || 0)));
        });
        // For migrated saves, restore configured starting owners on early turns.
        if (war.turn <= 2) {
            LEVEL05_REGION_LAYOUT.forEach(item => {
                const startOwner = LEVEL05_START_OWNER[item.id];
                const s = war.regions[item.id];
                if (!s || !startOwner) return;
                if (s.owner === 'none') {
                    s.owner = startOwner;
                    s.control = Math.max(40, Number(s.control) || 40);
                    s.supply = Math.max(34, Number(s.supply) || 34);
                    s.troops = Math.max(2, Number(s.troops) || 2);
                }
            });
        }

        return war;
    }

    function refreshTurnAp(war) {
        if (!war) return;
        LEVEL05_REGION_LAYOUT.forEach(item => {
            const s = war.regions[item.id];
            if (!s) return;
            if (s.owner === 'none' || isMinorFaction(s.owner)) s.ap = 0;
            else s.ap = s.owner === war.playerFaction ? 2 : 1;
        });
    }

    function getFactionRegionCount(war, faction) {
        if (!war || !faction) return 0;
        let count = 0;
        LEVEL05_REGION_LAYOUT.forEach(item => {
            const s = war.regions[item.id];
            if (s && s.owner === faction) count++;
        });
        return count;
    }

    function getFactionName(faction) {
        if (faction === 'cn') return '中国';
        if (faction === 'us') return '美国';
        if (faction === 'ru') return '俄罗斯';
        if (faction === 'eu') return '欧盟';
        if (faction === 'in') return '印度';
        if (faction === 'jp') return '日本';
        if (faction === 'ir') return '伊朗';
        if (faction === 'tw') return '台湾';
        if (faction === 've') return '委内瑞拉';
        if (faction === 'ua') return '乌克兰';
        if (faction === 'br') return '巴西';
        if (faction === 'eg') return '埃及';
        if (faction === 'sa') return '沙特';
        if (faction === 'pa') return '巴拿马';
        if (faction === 'mx') return '墨西哥';
        if (faction === 'ca') return '加拿大';
        if (faction === 'il') return '以色列';
        if (faction === 'iq') return '伊拉克';
        return '该国家';
    }

    function getFactionNameEn(faction) {
        if (faction === 'cn') return 'China';
        if (faction === 'us') return 'United States';
        if (faction === 'ru') return 'Russia';
        if (faction === 'eu') return 'European Union';
        if (faction === 'in') return 'India';
        if (faction === 'jp') return 'Japan';
        if (faction === 'ir') return 'Iran';
        if (faction === 'tw') return 'Taiwan';
        if (faction === 've') return 'Venezuela';
        if (faction === 'ua') return 'Ukraine';
        if (faction === 'br') return 'Brazil';
        if (faction === 'eg') return 'Egypt';
        if (faction === 'sa') return 'Saudi Arabia';
        if (faction === 'pa') return 'Panama';
        if (faction === 'mx') return 'Mexico';
        if (faction === 'ca') return 'Canada';
        if (faction === 'il') return 'Israel';
        if (faction === 'iq') return 'Iraq';
        return '';
    }

    function triggerNationDefeat(war, faction) {
        if (!war || war.gameOverShown) return;
        war.gameOverShown = true;
        war.phase = 'gameover';
        const nationName = getFactionName(faction);
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '⚠️ 国家灭亡',
                `${nationName} 已失去全部战区，战役失败。`,
                '重开',
                () => {
                    try {
                        localStorage.removeItem('spaceEmpireV5');
                        sessionStorage.setItem('resetFlag', 'true');
                    } catch (_) {}
                    location.reload(true);
                }
            );
        }
    }

    function checkElimination(war) {
        if (!war) return;
        if (getFactionRegionCount(war, war.playerFaction) <= 0) {
            triggerNationDefeat(war, war.playerFaction);
        }
    }

    function polygonCenter(poly) {
        if (!Array.isArray(poly) || !poly.length) return { x: 0.5, y: 0.5 };
        let sx = 0;
        let sy = 0;
        poly.forEach(p => {
            sx += Number(p[0]) || 0;
            sy += Number(p[1]) || 0;
        });
        return { x: sx / poly.length, y: sy / poly.length };
    }

    function polygonBounds(poly) {
        if (!Array.isArray(poly) || !poly.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        poly.forEach(p => {
            const x = Number(p[0]) || 0;
            const y = Number(p[1]) || 0;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        return { minX, maxX, minY, maxY };
    }

    function toScreenPoly(def) {
        if (!def || !mapRect || !Array.isArray(def.poly)) return null;
        const poly = getNormalizedPoly(def.poly);
        return poly.map(p => ({
            x: mapRect.x + (Number(p[0]) || 0) * mapRect.w,
            y: mapRect.y + (Number(p[1]) || 0) * mapRect.h
        }));
    }

    function getNormalizedPoly(poly) {
        if (!Array.isArray(poly)) return [];
        const s = LEVEL05_REGION_GLOBAL_SCALE;
        const fx = LEVEL05_REGION_FOCUS.x;
        const fy = LEVEL05_REGION_FOCUS.y;
        const ox = LEVEL05_REGION_OFFSET.x;
        const oy = LEVEL05_REGION_OFFSET.y;
        const verticalSpan = Math.max(0.1, 1 - LEVEL05_REGION_TOP_SAFE - LEVEL05_REGION_BOTTOM_SAFE);
        const clamp01 = v => Math.max(0, Math.min(1, v));
        const scaled = poly.map(p => {
            const x = Number(p[0]) || 0;
            const y = Number(p[1]) || 0;
            const nx = fx + (x - fx) * s;
            const ny = fy + (y - fy) * s;
            return [
                clamp01(nx + ox),
                clamp01(LEVEL05_REGION_TOP_SAFE + ny * verticalSpan + oy)
            ];
        });
        if (LEVEL05_REGION_INSET_SCALE >= 0.999) return scaled;
        const c = polygonCenter(scaled);
        const is = LEVEL05_REGION_INSET_SCALE;
        return scaled.map(p => [
            c.x + (p[0] - c.x) * is,
            c.y + (p[1] - c.y) * is
        ]);
    }

    function pointInPolygon(x, y, poly) {
        if (!Array.isArray(poly) || poly.length < 3) return false;
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x;
            const yi = poly[i].y;
            const xj = poly[j].x;
            const yj = poly[j].y;
            const intersect = ((yi > y) !== (yj > y))
                && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function getRegionScreenPos(def) {
        if (!def || !mapRect) return null;
        const normalizedPoly = getNormalizedPoly(def.poly);
        const center = polygonCenter(normalizedPoly);
        const bounds = polygonBounds(normalizedPoly);
        const rw = Math.max(0.02, bounds.maxX - bounds.minX) * mapRect.w;
        const rh = Math.max(0.02, bounds.maxY - bounds.minY) * mapRect.h;
        return {
            x: mapRect.x + center.x * mapRect.w,
            y: mapRect.y + center.y * mapRect.h,
            r: Math.max(16, Math.min(rw, rh) * 0.34)
        };
    }

    function getRegionByPoint(x, y) {
        if (!mapRect || !mapClipRect) return null;
        if (x < mapClipRect.x || x > mapClipRect.x + mapClipRect.w || y < mapClipRect.y || y > mapClipRect.y + mapClipRect.h) {
            return null;
        }
        for (let i = LEVEL05_REGION_LAYOUT.length - 1; i >= 0; i--) {
            const def = LEVEL05_REGION_LAYOUT[i];
            const screenPoly = toScreenPoly(def);
            if (pointInPolygon(x, y, screenPoly)) return def;
        }
        return null;
    }
    function getNearestRegionByPoint(x, y) {
        if (!mapRect || !mapClipRect) return null;
        let best = null;
        let bestD2 = Infinity;
        LEVEL05_REGION_LAYOUT.forEach(def => {
            const pos = getRegionScreenPos(def);
            if (!pos) return;
            const dx = x - pos.x;
            const dy = y - pos.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestD2) {
                bestD2 = d2;
                best = { def, r: pos.r };
            }
        });
        if (!best) return null;
        const threshold = Math.max(26, (Number(best.r) || 18) * 1.6);
        return bestD2 <= threshold * threshold ? best.def : null;
    }
    function isPointInMap(x, y) {
        if (!mapClipRect) return false;
        return x >= mapClipRect.x && x <= mapClipRect.x + mapClipRect.w
            && y >= mapClipRect.y && y <= mapClipRect.y + mapClipRect.h;
    }

    function resolveAttack(war, attackerFaction, fromDef, toDef) {
        if (!war || !fromDef || !toDef) return false;
        const fromState = war.regions[fromDef.id];
        const toState = war.regions[toDef.id];
        if (!fromState || !toState) return false;
        if (fromState.owner !== attackerFaction || toState.owner === attackerFaction) return false;
        if (!Array.isArray(fromDef.adj) || !fromDef.adj.includes(toDef.id)) return false;
        if ((Number(fromState.troops) || 0) < 2) return false;
        if ((Number(fromState.ap) || 0) <= 0) return false;

        const committed = Math.max(2, Math.min(8, Math.floor((Number(fromState.troops) || 0) * 0.55)));
        fromState.troops = Math.max(1, (Number(fromState.troops) || 0) - committed);
        fromState.ap = Math.max(0, (Number(fromState.ap) || 0) - 1);

        const attPower = getFactionPowerScale(attackerFaction)
            * (0.72 + fromState.control / 140)
            * (0.75 + fromState.supply / 160)
            * (0.75 + committed / 10);
        const defPower = getFactionPowerScale(toState.owner) * (0.62 + toState.control / 150) * (0.78 + toState.supply / 170);
        const swing = attPower - defPower;
        const damage = Math.max(6, Math.min(26, 13 + swing * 14 + (Math.random() - 0.5) * 5));
        const recoil = Math.max(2, Math.min(9, 4 + defPower * 2.4 + Math.random() * 2.2));

        toState.control -= damage;
        fromState.control = Math.max(24, fromState.control - recoil);
        fromState.supply = Math.max(18, fromState.supply - (3 + Math.random() * 2));
        toState.troops = Math.max(1, (Number(toState.troops) || 0) - Math.max(1, Math.round(committed * (0.35 + Math.random() * 0.25))));

        const fromPos = getRegionScreenPos(fromDef);
        const toPos = getRegionScreenPos(toDef);
        if (fromPos && toPos) {
            war.attackFx.push({
                fromX: fromPos.x,
                fromY: fromPos.y,
                toX: toPos.x,
                toY: toPos.y,
                attacker: attackerFaction,
                startAt: performance.now(),
                duration: 460,
                committed
            });
            if (war.attackFx.length > 14) war.attackFx.splice(0, war.attackFx.length - 14);
        }

        if (toState.control <= 0) {
            toState.owner = attackerFaction;
            toState.control = 34 + Math.random() * 18;
            toState.supply = 42 + Math.random() * 20;
            toState.troops = Math.max(2, Math.floor(committed * 0.6));
            if (window.game && attackerFaction === war.playerFaction) {
                window.game.ore = Math.max(0, Number(window.game.ore) || 0) + 180;
                window.game.tech = Math.max(0, Number(window.game.tech) || 0) + 70;
                if (typeof window.updateUI === 'function') window.updateUI();
            }
        }
        return true;
    }

    function findCardBattleSourceRegion(war) {
        if (!war) return null;
        // Legacy tactical constraints removed: pick any owned region as launch source.
        const owned = LEVEL05_REGION_LAYOUT.find(def => {
            const s = war.regions[def.id];
            return !!s && s.owner === war.playerFaction;
        });
        return owned || null;
    }

    function resolveMove(war, faction, fromDef, toDef) {
        if (!war || !fromDef || !toDef) return false;
        const fromState = war.regions[fromDef.id];
        const toState = war.regions[toDef.id];
        if (!fromState || !toState) return false;
        if (fromState.owner !== faction || toState.owner !== faction) return false;
        if (!Array.isArray(fromDef.adj) || !fromDef.adj.includes(toDef.id)) return false;
        if ((Number(fromState.ap) || 0) <= 0) return false;
        if ((Number(fromState.troops) || 0) < 2) return false;

        const moved = Math.max(1, Math.min(7, Math.floor((Number(fromState.troops) || 0) * 0.45)));
        fromState.troops = Math.max(1, (Number(fromState.troops) || 0) - moved);
        toState.troops = Math.max(1, Math.min(40, (Number(toState.troops) || 0) + moved));
        fromState.ap = Math.max(0, (Number(fromState.ap) || 0) - 1);

        const fromPos = getRegionScreenPos(fromDef);
        const toPos = getRegionScreenPos(toDef);
        if (fromPos && toPos) {
            war.attackFx.push({
                fromX: fromPos.x,
                fromY: fromPos.y,
                toX: toPos.x,
                toY: toPos.y,
                attacker: faction,
                startAt: performance.now(),
                duration: 380,
                committed: moved,
                moveOnly: true
            });
            if (war.attackFx.length > 14) war.attackFx.splice(0, war.attackFx.length - 14);
        }
        return true;
    }

    function runAiTurn(war, faction) {
        if (!war || faction === war.playerFaction) return;
        for (let step = 0; step < 2; step++) {
            const candidates = [];
            LEVEL05_REGION_LAYOUT.forEach(def => {
                const state = war.regions[def.id];
                if (!state || state.owner !== faction) return;
                if ((Number(state.ap) || 0) <= 0 || (Number(state.troops) || 0) < 2) return;
                (def.adj || []).forEach(adjId => {
                    const targetDef = LEVEL05_REGION_LAYOUT.find(r => r.id === adjId);
                    const targetState = targetDef ? war.regions[targetDef.id] : null;
                    if (!targetDef || !targetState || targetState.owner === faction) return;
                    const value = (100 - targetState.control) + (targetState.owner === war.playerFaction ? 16 : 0) + Math.random() * 12;
                    candidates.push({ fromDef: def, toDef: targetDef, score: value });
                });
            });
            if (!candidates.length) break;
            candidates.sort((a, b) => b.score - a.score);
            resolveAttack(war, faction, candidates[0].fromDef, candidates[0].toDef);
        }
    }

    function finishRound(war) {
        if (!war) return;
        war.turn = Math.max(1, Number(war.turn) || 1) + 1;
        LEVEL05_FACTION_ORDER.forEach(f => runAiTurn(war, f));
        Object.keys(war.regions).forEach(id => {
            const state = war.regions[id];
            state.control = Math.max(8, Math.min(100, state.control + 1.5 + Math.random() * 2.2));
            state.supply = Math.max(10, Math.min(100, state.supply + 2.2 + Math.random() * 3));
            if (state.owner === 'none') {
                state.troops = 0;
            } else {
                const isMinor = isMinorFaction(state.owner);
                const growth = isMinor ? (Math.random() < 0.35 ? 1 : 0) : (1 + (Math.random() < 0.35 ? 1 : 0));
                const cap = isMinor ? 9 : 22;
                state.troops = Math.max(1, Math.min(cap, (Number(state.troops) || 0) + growth));
            }
        });
        refreshTurnAp(war);
        war.phase = 'player';
        war.selectedRegionId = null;
        checkElimination(war);
    }

    function tryEndPlayerTurn(war) {
        // Legacy turn-based war flow is disabled in card-battle mode.
        // Keep function for compatibility with existing click path.
        if (!war) return;
    }

    function handleMapClick(x, y) {
        const war = ensureWarState();
        if (!war) return false;
        if (war.phase === 'gameover') return false;

        const now = performance.now();
        if (now - (war.lastActionAt || 0) < 120) return true;
        war.lastActionAt = now;
        war.phase = 'player';

        let hit = getRegionByPoint(x, y);
        if (!hit) hit = getNearestRegionByPoint(x, y);
        if (!hit) {
            war.selectedRegionId = null;
            return isPointInMap(x, y);
        }

        const hitState = war.regions[hit.id];
        if (!hitState) return true;
        // Disable old region selection behavior in card-battle mode.
        if (hitState.owner === war.playerFaction) {
            war.selectedRegionId = null;
            return true;
        }

        // Level 0.5 now enters card battle directly when clicking enemy/neutral territory.
        if (!window.CardBattle || window.CardBattle.isActive()) return true;

        const targetDef = hit;
        const sourceDef = findCardBattleSourceRegion(war);
        if (!sourceDef) return true;

        const fromId = sourceDef.id;
        const targetId = targetDef.id;
        const pFaction = getPlayerFactionFromGameCountry(war.playerFaction);

        window.CardBattle.start(pFaction, hitState.owner || 'none', {
            onVictory: () => {
                const fS = war.regions[fromId];
                const tS = war.regions[targetId];
                if (!fS || !tS) return;
                const committed = Math.max(2, Math.min(8, Math.floor((Number(fS.troops) || 0) * 0.35)));
                fS.troops = Math.max(1, (Number(fS.troops) || 0) - committed);
                tS.owner = war.playerFaction;
                tS.control = 40 + Math.random() * 20;
                tS.supply = 45 + Math.random() * 20;
                tS.troops = Math.max(2, Math.floor(committed * 0.6));
                if (window.game) {
                    window.game.ore = Math.max(0, Number(window.game.ore) || 0) + 220;
                    window.game.tech = Math.max(0, Number(window.game.tech) || 0) + 90;
                    if (typeof window.updateUI === 'function') window.updateUI();
                }
                checkElimination(war);
            },
            onDefeat: () => {
                const fS = war.regions[fromId];
                if (!fS) return;
                fS.troops = Math.max(1, Math.floor((Number(fS.troops) || 0) * 0.55));
                if (window.game) {
                    window.game.tech = Math.max(0, (Number(window.game.tech) || 0) - 40);
                    if (typeof window.updateUI === 'function') window.updateUI();
                }
            }
        });
        war.selectedRegionId = null;
        return true;
    }

    function handlePointerMove(x, y) {
        const war = ensureWarState();
        if (!war) {
            return { cursor: 'default' };
        }

        let hoverEndTurn = false;
        if (endTurnRect && war.phase === 'player') {
            const b = endTurnRect;
            const hitPad = 14;
            hoverEndTurn = x >= b.x - hitPad && x <= b.x + b.w + hitPad
                && y >= b.y - hitPad && y <= b.y + b.h + hitPad;
        }
        war.hoverEndTurn = hoverEndTurn;

        if (war.phase === 'player') {
            const hit = getRegionByPoint(x, y);
            war.hoverRegionId = hit ? hit.id : null;
        } else {
            war.hoverRegionId = null;
        }

        return {
            cursor: hoverEndTurn ? 'pointer' : 'default'
        };
    }

    function drawFactionFlagBadge(ctx, faction, x, y, size) {
        const w = Math.max(14, size * 0.95);
        const h = Math.max(10, size * 0.62);
        const left = x - w * 0.5;
        const top = y - h * 0.5;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(left, top, w, h, 2);
        ctx.clip();

        function drawStar(cx, cy, outerR, innerR, points = 5) {
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const ang = -Math.PI / 2 + (i * Math.PI) / points;
                const rr = i % 2 === 0 ? outerR : innerR;
                const px = cx + Math.cos(ang) * rr;
                const py = cy + Math.sin(ang) * rr;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }

        if (faction === 'ru') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
        } else if (faction === 'cn') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#facc15';
            drawStar(
                left + w * 0.28,
                top + h * 0.36,
                Math.max(2, h * 0.18),
                Math.max(1, h * 0.075),
                5
            );
            const smallOuter = Math.max(0.9, h * 0.06);
            const smallInner = Math.max(0.45, h * 0.026);
            const smallStars = [
                [0.43, 0.18],
                [0.50, 0.29],
                [0.50, 0.44],
                [0.42, 0.56]
            ];
            smallStars.forEach(s => {
                drawStar(
                    left + w * s[0],
                    top + h * s[1],
                    smallOuter,
                    smallInner,
                    5
                );
            });
        } else if (faction === 'eu') {
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#facc15';
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const sx = left + w * 0.5 + Math.cos(a) * w * 0.17;
                const sy = top + h * 0.5 + Math.sin(a) * h * 0.22;
                ctx.beginPath();
                ctx.arc(sx, sy, Math.max(1, h * 0.04), 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (faction === 'jp') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(left + w * 0.5, top + h * 0.5, Math.max(2, h * 0.24), 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 'in') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(left + w * 0.5, top + h * 0.5, Math.max(1.1, h * 0.10), 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 'ir') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
        } else if (faction === 'tw') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(left, top, w * 0.48, h * 0.58);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(left + w * 0.24, top + h * 0.30, Math.max(1.1, h * 0.10), 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 've') {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
        } else if (faction === 'ua') {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(left, top, w, h / 2);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(left, top + h / 2, w, h / 2);
        } else if (faction === 'br') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(left + w * 0.5, top + h * 0.14);
            ctx.lineTo(left + w * 0.84, top + h * 0.5);
            ctx.lineTo(left + w * 0.5, top + h * 0.86);
            ctx.lineTo(left + w * 0.16, top + h * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#1d4ed8';
            ctx.beginPath();
            ctx.arc(left + w * 0.5, top + h * 0.5, Math.max(1.1, h * 0.12), 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 'eg') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#111827';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
        } else if (faction === 'sa') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left + w * 0.20, top + h * 0.66, w * 0.60, Math.max(1, h * 0.07));
        } else if (faction === 'mx') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left, top, w / 3, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left + w / 3, top, w / 3, h);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left + (w * 2) / 3, top, w / 3, h);
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(left + w * 0.5, top + h * 0.52, Math.max(0.8, h * 0.06), 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 'ca') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w * 0.25, h);
            ctx.fillRect(left + w * 0.75, top, w * 0.25, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left + w * 0.25, top, w * 0.5, h);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left + w * 0.46, top + h * 0.30, w * 0.08, h * 0.40);
        } else if (faction === 'pa') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top, w * 0.5, h * 0.5);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left + w * 0.5, top, w * 0.5, h * 0.5);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(left, top + h * 0.5, w * 0.5, h * 0.5);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left + w * 0.5, top + h * 0.5, w * 0.5, h * 0.5);
        } else if (faction === 'il') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(left, top + h * 0.12, w, h * 0.14);
            ctx.fillRect(left, top + h * 0.74, w, h * 0.14);
            ctx.beginPath();
            ctx.moveTo(left + w * 0.5, top + h * 0.34);
            ctx.lineTo(left + w * 0.60, top + h * 0.56);
            ctx.lineTo(left + w * 0.40, top + h * 0.56);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(left + w * 0.5, top + h * 0.66);
            ctx.lineTo(left + w * 0.60, top + h * 0.44);
            ctx.lineTo(left + w * 0.40, top + h * 0.44);
            ctx.closePath();
            ctx.fill();
        } else if (faction === 'iq') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w, h / 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(left, top + h / 3, w, h / 3);
            ctx.fillStyle = '#111827';
            ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(left + w * 0.42, top + h * 0.42, w * 0.16, h * 0.14);
        } else {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(left, top, w, h);
            ctx.fillStyle = '#ffffff';
            for (let i = 1; i <= 3; i++) {
                ctx.fillRect(left, top + (h * i) / 7, w, Math.max(1, h * 0.08));
            }
            ctx.fillStyle = '#1d4ed8';
            ctx.fillRect(left, top, w * 0.42, h * 0.56);
        }

        ctx.restore();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeRect(left, top, w, h);
        ctx.restore();
    }

    function drawWarOverlay(ctx, panelX, panelY, panelW, panelH, imageRect) {
        const war = ensureWarState();
        if (!war) return;
        war.phase = 'player';
        if (imageRect && Number.isFinite(imageRect.x) && Number.isFinite(imageRect.y)
            && Number.isFinite(imageRect.w) && Number.isFinite(imageRect.h)
            && imageRect.w > 1 && imageRect.h > 1) {
            mapRect = { x: imageRect.x, y: imageRect.y, w: imageRect.w, h: imageRect.h };
        } else {
            mapRect = { x: panelX, y: panelY, w: panelW, h: panelH };
        }

        mapClipRect = { x: mapRect.x, y: mapRect.y, w: mapRect.w, h: mapRect.h };
        if ((Number(war.turn) || 0) <= 1) {
            refreshTurnAp(war);
        }

        endTurnRect = null;

        ctx.save();
        ctx.beginPath();
        ctx.rect(panelX, panelY, panelW, panelH);
        ctx.clip();
        LEVEL05_REGION_LAYOUT.forEach(def => {
            const state = war.regions[def.id];
            if (!state) return;
            const screenPoly = toScreenPoly(def);
            if (!screenPoly || screenPoly.length < 3) return;
            const pos = getRegionScreenPos(def);
            if (!pos) return;
            const px = pos.x;
            const py = pos.y;
            const rr = pos.r;
            const factionColor = LEVEL05_FACTION_COLOR[state.owner] || 'rgba(148,163,184,0.38)';
            const hovered = war.hoverRegionId === def.id;
            const isNeutral = state.owner === 'none';

            ctx.beginPath();
            ctx.moveTo(screenPoly[0].x, screenPoly[0].y);
            for (let i = 1; i < screenPoly.length; i++) {
                ctx.lineTo(screenPoly[i].x, screenPoly[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = factionColor;
            ctx.fill();

            ctx.lineWidth = hovered ? 2.4 : 1.4;
            if (isNeutral) {
                ctx.setLineDash([7, 6]);
                ctx.strokeStyle = 'rgba(148,163,184,0.72)';
            } else {
                ctx.setLineDash([]);
                ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.82)' : 'rgba(226,232,240,0.65)';
            }
            ctx.stroke();
            ctx.setLineDash([]);

            if (!isNeutral) {
                drawFactionFlagBadge(ctx, state.owner, px, py - rr * 0.04, rr * 0.95);
                const nameEn = getFactionNameEn(state.owner);
                if (nameEn) {
                    ctx.fillStyle = 'rgba(255,255,255,0.90)';
                    ctx.font = `700 ${Math.max(7, rr * 0.18)}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(nameEn, px, py - rr * 0.36);
                }
            } else {
                ctx.fillStyle = 'rgba(203,213,225,0.8)';
                ctx.font = `${Math.max(10, rr * 0.46)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('□', px, py - rr * 0.05);
            }

            // Legacy troop number display disabled in card-battle mode.
        });

        const now = performance.now();
        war.attackFx = (war.attackFx || []).filter(fx => now - fx.startAt <= fx.duration);
        war.attackFx.forEach(fx => {
            const p = Math.max(0, Math.min(1, (now - fx.startAt) / fx.duration));
            const x = fx.fromX + (fx.toX - fx.fromX) * p;
            const y = fx.fromY + (fx.toY - fx.fromY) * p;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(fx.fromX, fx.fromY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.fillStyle = LEVEL05_FACTION_COLOR[fx.attacker] || 'rgba(255,255,255,0.65)';
            ctx.beginPath();
            ctx.arc(x, y, 3 + fx.committed * 0.16, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.font = '700 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('卡牌战模式：点击任意敌方/中立领土开始战斗', panelX + 10, panelY + 8);
        ctx.restore();
    }

    window.Level05Scene = {
        RENDER_MODE,
        isRenderMode,
        resetFrameState,
        ensureWarState,
        getRegionByPoint,
        isPointInMap,
        handleMapClick,
        handlePointerMove,
        drawWarOverlay
    };

    tryLoadGeoJsonLayout();
})();
