import { getGeometryBounds } from "src/utils/geojson";
import maplibregl from "maplibre-gl";
import {
    allIndicators,
    type Indicator,
    type IndicatorName,
    type LayerName,
    signatures,
} from "src/constants";
import { unscale } from "src/utils/scenarios";

// Construct raw HTML for the hover popup. This is really ugly, but MapLibre
// doesn't seem to let us do much else (?).
function makeHoverHtml(feat: GeoJSON.Feature,
    compareScenarioName: string | null,
    activeFactor: LayerName,
) {
    // Generate a rectangle of a given colour
    function makeColoredBlock(color: string): string {
        return `<span class="colored-block" style="background-color: ${color}"></span>`
    }

    // Generate the HTML showing the signature type
    function makeSig(): string {
        const sig: number = feat.properties["signature_type"];
        const sigName: string = signatures[sig].name;
        const sigColor: string = signatures[sig].color;
        if (compareScenarioName === null) {
            return activeFactor === "signature_type"
                ? `<span class="oa-grid-item strong">${makeColoredBlock(sigColor)}&nbsp;${sigName}</span>`
                : `<span class="oa-grid-item strong">${sigName}</span>`;
        } else {
            console.log(feat.properties);
            const cmpSig = signatures[feat.properties["signature_type-cmp"]].name;
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
            const cmpValUnscaled = unscale(name, cmpVal);
            const valUnscaled = unscale(name, val);
            const chg = cmpValUnscaled === 0
                ? 0
                : ((valUnscaled - cmpValUnscaled) / cmpValUnscaled) * 100;
            color = feat.properties[`${name}-diff-color`];
            valString = `${val.toFixed(2)} (${chg >= 0 ? "+" : "−"
                }${Math.abs(chg).toFixed(1)}%)`;
        }
        return [
            `<span>${indi.short.replace(
                "accessibility",
                "access."
            )}</span>`,
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
        `<span class="oa-grid-item oa-name">${feat.properties.OA11CD}</span>`,
        makeSig(),
        ...[...allIndicators.entries()].map(([name, indi]) => makeIndi(name, indi)),
        `</div>`,
    ].join("");
}

export function makePopup(
    map: maplibregl.Map,
    feat: GeoJSON.Feature,
    compareScenarioName: string | null,
    activeFactor: LayerName,
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
