import { getGeometryBounds } from "src/utils/geojson";
import maplibregl from "maplibre-gl";
import {
    type Indicator,
    type IndicatorName,
    type LayerName,
} from "src/types";
import { unscale } from "src/utils/scenarios";
import config from "src/data/config";

// Construct raw HTML for the hover popup. This is really ugly, but MapLibre
// doesn't seem to let us do much else (?).
function makeHoverHtml(feat: GeoJSON.Feature,
    compareScenarioName: string | null,
    activeFactor: LayerName,
    scaleFactors: Map<LayerName, { min: number, max: number }>,
) {
    // Generate a rectangle of a given colour
    function makeColoredBlock(color: string): string {
        return `<span class="colored-block" style="background-color: ${color}"></span>`
    }

    // Generate the HTML showing the signature type
    function makeSig(): string {
        const sig: number = feat.properties["signature_type"];
        const sigName: string = config.signatures[sig].name;
        const sigColor: string = config.signatures[sig].color;
        if (compareScenarioName === null) {
            return activeFactor === "signature_type"
                ? `<span class="oa-grid-item strong">${makeColoredBlock(sigColor)}&nbsp;${sigName}</span>`
                : `<span class="oa-grid-item strong">${sigName}</span>`;
        } else {
            const cmpSig = config.signatures[feat.properties["signature_type-cmp"]].name;
            if (sigName === cmpSig) {
                return activeFactor === "signature_type"
                    ? `<span class="oa-grid-item strong">${makeColoredBlock(sigColor)}&nbsp;${sigName}</span>`
                    : `<span class="oa-grid-item strong">${sigName}</span>`;
            } else {
                return activeFactor === "signature_type"
                    ? `<span class="oa-grid-item old-sig">${cmpSig}</span><span class="oa-grid-item strong">&nbsp;&nbsp;↳ &nbsp;${makeColoredBlock(sigColor)}&nbsp;${sigName}</span>`
                    : `<span class="oa-grid-item old-sig">${cmpSig}</span><span class="oa-grid-item strong">&nbsp;&nbsp;↳ ${sigName}</span>`;
            }
        }
    }

    // Generate the HTML for a given indicator value
    function makeIndi(name: IndicatorName, indi: Indicator): string {
        const val = feat.properties[name];
        let color: string;
        let valString: string;
        if (compareScenarioName === null) {
            valString = val.toFixed(2);
            color = feat.properties[`${name}-color`];
        } else {
            const cmpVal = feat.properties[`${name}-cmp`];
            const cmpValUnscaled = unscale(name, cmpVal, scaleFactors);
            const valUnscaled = unscale(name, val, scaleFactors);
            const chg = cmpValUnscaled === 0
                ? 0
                : ((valUnscaled - cmpValUnscaled) / cmpValUnscaled) * 100;
            color = feat.properties[`${name}-diff-color`];
            valString = `${val.toFixed(2)} (${chg >= 0 ? "+" : "−"
                }${Math.abs(chg).toFixed(1)}%)`;
        }
        return [
            `<span>${indi.hover}</span>`,
            `<span class="right-align-grid-item ${activeFactor === name ? "strong" : ""
            }">`,
            activeFactor === name ? `${makeColoredBlock(color)}&nbsp;` : ``,
            valString,
            `</span>`,
        ].join("");
    }

    // Put it all together
    return [
        `<div class="hover-grid">`,
        `<span class="oa-grid-item oa-name">${feat.properties[config.featureIdentifier]}</span>`,
        makeSig(),
        ...[...config.allIndicators.entries()].map(([name, indi]) => makeIndi(name, indi)),
        `</div>`,
    ].join("");
}

export function makePopup(
    map: maplibregl.Map,
    feat: GeoJSON.Feature,
    compareScenarioName: string | null,
    activeFactor: LayerName,
    closeButton: boolean,
    scaleFactors: Map<LayerName, { min: number, max: number }>,
) {
    const bounds = getGeometryBounds(feat.geometry);
    const popup = new maplibregl.Popup({
        closeButton: closeButton,
        closeOnClick: false,
        anchor: "bottom",
        maxWidth: "none",
    })
        .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
        .setHTML(makeHoverHtml(feat, compareScenarioName, activeFactor, scaleFactors))
        .addTo(map);
    return popup;
}
