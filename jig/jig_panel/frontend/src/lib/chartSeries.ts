// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

/**
 * Turns the series of a `jig.Chart` into Plotly traces.
 *
 * A series without a style is drawn exactly as before: a line with markers,
 * coloured and shaped by its position in the chart. A style only overrides
 * what it sets, so old charts and unstyled series look the same as they did.
 */

export type SeriesMode = "lines" | "markers" | "lines+markers";

/** The `SeriesStyle` of a chart series, as stored in the run document. */
export interface SeriesStyle {
  mode?: SeriesMode | null;
  color?: string | null;
  marker_symbol?: string | null;
  marker_size?: number | null;
  line_dash?: string | null;
  line_width?: number | null;
  opacity?: number | null;
  hover_text?: string[] | null;
  color_values?: number[] | null;
  colorbar_title?: string | null;
  show_legend?: boolean;
}

/** One series of a chart, a null point being a gap in the line. */
export interface ChartSeries {
  x_data: (number | null)[];
  y_data: (number | null)[];
  marker_name: string;
  style?: SeriesStyle | null;
}

/** What the panel draws when a style does not say otherwise. */
export interface SeriesDefaults {
  color: string;
  markerLineColor: string;
  symbol: string;
  markerSize: number;
  markerLineWidth: number;
  lineWidth: number;
}

/** Colour scale of the series whose points carry a value each. */
export const COLOR_SCALE = "Viridis";

const COLORBAR_THICKNESS_PIXELS = 12;
const COLORBAR_LENGTH_FRACTION = 0.8;

/**
 * The Plotly trace of one series.
 * @param {ChartSeries} series - The series and its optional style.
 * @param {SeriesDefaults} defaults - The look of an unstyled series at this position.
 * @returns {Record<string, unknown>} A `scatter` trace.
 */
export function toPlotlyTrace(
  series: ChartSeries,
  defaults: SeriesDefaults,
): Record<string, unknown> {
  const style = series.style ?? {};
  const hasColorValues = Array.isArray(style.color_values);
  const color = style.color ?? defaults.color;

  const marker: Record<string, unknown> = {
    color: hasColorValues ? style.color_values : color,
    symbol: style.marker_symbol ?? defaults.symbol,
    size: style.marker_size ?? defaults.markerSize,
    line: {
      width: defaults.markerLineWidth,
      color: style.color ?? defaults.markerLineColor,
    },
  };
  if (hasColorValues) {
    marker.colorscale = COLOR_SCALE;
    marker.showscale = true;
    marker.colorbar = {
      title: { text: style.colorbar_title ?? "" },
      thickness: COLORBAR_THICKNESS_PIXELS,
      len: COLORBAR_LENGTH_FRACTION,
    };
  }

  const trace: Record<string, unknown> = {
    x: series.x_data,
    y: series.y_data,
    type: "scatter",
    mode: style.mode ?? "lines+markers",
    name: series.marker_name,
    showlegend: style.show_legend ?? true,
    marker,
    line: {
      width: style.line_width ?? defaults.lineWidth,
      dash: style.line_dash ?? "solid",
      color,
    },
  };
  if (style.opacity !== null && style.opacity !== undefined) {
    trace.opacity = style.opacity;
  }
  if (Array.isArray(style.hover_text)) {
    trace.text = style.hover_text;
    trace.hoverinfo = "text+name";
  }
  return trace;
}

/**
 * The Y axis settings that make one unit of Y as long as one unit of X.
 * @param {boolean} equalAspect - Whether the chart shows positions.
 * @returns {Record<string, unknown>} Settings to spread into `layout.yaxis`.
 */
export function equalAspectAxis(equalAspect: boolean): Record<string, unknown> {
  return equalAspect ? { scaleanchor: "x", scaleratio: 1 } : {};
}
