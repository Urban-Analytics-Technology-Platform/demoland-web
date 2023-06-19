import { getGeometryBounds } from "./utils";
import maplibregl from "maplibre-gl";
import {
    allIndicators,
    type Indicator,
    type FactorName,
    type ScenarioName,
    signatures,
} from "./constants";

// Construct raw HTML for the hover popup. This is really ugly, but works well
// enough for our small use case.
function makeHoverHtml(feat: GeoJSON.Feature,
    compareScenarioName: ScenarioName | null,
    activeFactor: FactorName,
) {
    function makeSig(): string {
        const sig = signatures[feat.properties.sig].name;
        if (compareScenarioName === null) {
            return `<span class="oa-grid-item strong">${sig}</span>`;
        } else {
            const cmpSig = signatures[feat.properties["sig-cmp"]].name;
            if (sig === cmpSig) {
                return `<span class="oa-grid-item strong">${sig}</span>`;
            } else {
                return `<span class="oa-grid-item old-sig">${cmpSig}</span><span class="oa-grid-item strong">&nbsp;&nbsp;↳ ${sig}</span>`;
            }
        }
    }
    function makeIndi(indi: Indicator): string {
        const val = feat.properties[indi.name];
        let valString: string;
        if (compareScenarioName === null) {
            valString = val.toFixed(2);
        } else {
            const cmpVal = feat.properties[`${indi.name}-cmp`];
            const chg = cmpVal === 0 ? 0 : ((val - cmpVal) / cmpVal) * 100;
            valString = `${val.toFixed(2)} (${
                chg >= 0 ? "+" : "−"
            }${Math.abs(chg).toFixed(1)}%)`;
        }
        return [
            `<span>${indi.short.replace(
                "accessibility",
                "access."
            )}</span>`,
            `<span class="right-align-grid-item ${
                activeFactor === indi.name ? "strong" : ""
            }">`,
            valString,
            `</span>`,
        ].join("");
    }
    return [
        `<div class="hover-grid">`,
        `<span class="oa-grid-item oa-name">${feat.properties.OA11CD}</span>`,
        makeSig(),
        ...allIndicators.map(makeIndi),
        `</div>`,
    ].join("");
}

export function makePopup(
    map: maplibregl.Map,
    feat: GeoJSON.Feature,
    compareScenarioName: ScenarioName | null,
    activeFactor: FactorName,
    closeButton: boolean,
) {
    const bounds = getGeometryBounds(feat.geometry);
    const popup = new maplibregl.Popup({
        closeButton: closeButton,
        closeOnClick: false,
        anchor: "bottom",
        maxWidth: "none",
    })
        .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
        .setHTML(makeHoverHtml(feat, compareScenarioName, activeFactor))
        .addTo(map);
    return popup;
}
