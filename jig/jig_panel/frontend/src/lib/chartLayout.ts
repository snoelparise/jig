// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

/**
 * Sizes a chart from the width it actually has and the data it shows.
 *
 * The plot fills its container's width. Its height follows the data for a
 * chart of positions (equal axes), so a map of the screen is drawn as a
 * screen and not squeezed into a fixed band. The legend sits under the
 * axes, in room reserved for it, instead of over the plot; the title is
 * wrapped to the width, in room reserved for it, instead of clipped.
 */

import type { ChartSeries } from "./chartSeries";

export type TextMeasure = (text: string) => number;

export interface ChartMargin {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface ChartFrame {
  width: number;
  height: number;
  margin: ChartMargin;
  /** Title with `<br>` where it wraps; empty when the chart has none. */
  title: string;
  /** Legend top, in paper coordinates (negative: under the plot area). */
  legendY: number;
}

export interface FrameOptions {
  /** Width available to the whole chart, in pixels. */
  width: number;
  /**
   * Height to fill, in pixels. Left out, the height follows the data on
   * equal axes and is the plot band otherwise.
   */
  height?: number;
  equalAspect: boolean;
  series: ChartSeries[];
  title?: string;
  legendNames: string[];
  titleFontSize: number;
  legendFontSize: number;
  measure: TextMeasure;
}

export const MIN_WIDTH = 250;
export const MIN_PLOT_HEIGHT = 180;
export const MAX_PLOT_HEIGHT = 700;
export const MARGIN_LEFT = 75;
export const MARGIN_RIGHT = 30;
/** Tick labels, the axis title and its standoff, under the plot area. */
export const AXIS_SPACE_BELOW = 62;
export const LEGEND_ROW_HEIGHT = 22;
export const LEGEND_ENTRY_PADDING = 44;
export const LEGEND_GAP = 6;
export const TITLE_LINE_HEIGHT_FACTOR = 1.4;
export const TITLE_PADDING = 12;
export const TOP_PADDING_WITHOUT_TITLE = 24;

/**
 * The extent of the data on each axis, gaps ignored.
 * @param {ChartSeries[]} series - The series of the chart.
 * @returns {{x: number, y: number}} Each span at least 1, so a ratio is always defined.
 */
export function dataSpans(series: ChartSeries[]): { x: number; y: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const one of series) {
    for (const value of one.x_data) {
      if (value !== null && Number.isFinite(value)) {
        minX = Math.min(minX, value);
        maxX = Math.max(maxX, value);
      }
    }
    for (const value of one.y_data) {
      if (value !== null && Number.isFinite(value)) {
        minY = Math.min(minY, value);
        maxY = Math.max(maxY, value);
      }
    }
  }
  return {
    x: Number.isFinite(maxX - minX) ? Math.max(maxX - minX, 1) : 1,
    y: Number.isFinite(maxY - minY) ? Math.max(maxY - minY, 1) : 1,
  };
}

/**
 * Breaks a title into lines no wider than `maxWidth`, at spaces.
 *
 * A word wider than the line stays whole on its own line: cutting inside a
 * word would hide an identifier.
 * @param {string} title - The title text.
 * @param {number} maxWidth - Width available, in pixels.
 * @param {TextMeasure} measure - Width of a text, in pixels.
 * @returns {string} The title with `<br>` between lines.
 */
export function wrapTitle(
  title: string,
  maxWidth: number,
  measure: TextMeasure,
): string {
  const words = title.trim().split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines.join("<br>");
}

/**
 * How many rows a horizontal legend needs for these entries.
 * @param {string[]} names - The legend entries.
 * @param {number} availableWidth - Width of the plot area, in pixels.
 * @param {TextMeasure} measure - Width of a text, in pixels.
 * @returns {number} At least 1 when there is an entry, 0 otherwise.
 */
export function legendRowCount(
  names: string[],
  availableWidth: number,
  measure: TextMeasure,
): number {
  if (names.length === 0) {
    return 0;
  }
  let rows = 1;
  let used = 0;
  for (const name of names) {
    const entryWidth = measure(name) + LEGEND_ENTRY_PADDING;
    if (used > 0 && used + entryWidth > availableWidth) {
      rows += 1;
      used = entryWidth;
    } else {
      used += entryWidth;
    }
  }
  return rows;
}

/**
 * The frame of a chart: its size, margins, wrapped title and legend position.
 * @param {FrameOptions} options - What the chart shows and the width it has.
 * @returns {ChartFrame} The frame to lay the chart out in.
 */
export function frameChart(options: FrameOptions): ChartFrame {
  const width = Math.max(MIN_WIDTH, options.width);
  const plotWidth = width - MARGIN_LEFT - MARGIN_RIGHT;

  const title = options.title
    ? wrapTitle(options.title, plotWidth, options.measure)
    : "";
  const titleLines = title ? title.split("<br>").length : 0;
  const top = title
    ? TITLE_PADDING * 2 +
      titleLines * options.titleFontSize * TITLE_LINE_HEIGHT_FACTOR
    : TOP_PADDING_WITHOUT_TITLE;

  const legendRows = legendRowCount(
    options.legendNames,
    plotWidth,
    options.measure,
  );
  const bottom =
    AXIS_SPACE_BELOW +
    (legendRows > 0 ? LEGEND_GAP + legendRows * LEGEND_ROW_HEIGHT : 0);

  const available =
    options.height === undefined
      ? undefined
      : Math.max(MIN_PLOT_HEIGHT, options.height - top - bottom);
  const plotHeight = options.equalAspect
    ? equalAspectPlotHeight(plotWidth, dataSpans(options.series), available)
    : (available ?? MIN_PLOT_HEIGHT);

  return {
    width,
    height: Math.round(top + plotHeight + bottom),
    margin: {
      l: MARGIN_LEFT,
      r: MARGIN_RIGHT,
      t: Math.round(top),
      b: Math.round(bottom),
    },
    title,
    legendY: -AXIS_SPACE_BELOW / plotHeight,
  };
}

function equalAspectPlotHeight(
  plotWidth: number,
  spans: { x: number; y: number },
  available: number | undefined,
): number {
  const natural = (plotWidth * spans.y) / spans.x;
  const cap = available ?? Math.min(MAX_PLOT_HEIGHT, plotWidth * 1.25);
  return Math.max(MIN_PLOT_HEIGHT, Math.min(natural, cap));
}

/**
 * Measures text with the canvas when the browser has one, and estimates it
 * from the character count otherwise (tests run without a canvas).
 * @param {number} fontSize - Font size, in pixels.
 * @returns {TextMeasure} A measurer for that font size.
 */
export function textMeasurer(fontSize: number): TextMeasure {
  const context =
    typeof document === "undefined"
      ? null
      : document.createElement("canvas").getContext("2d");
  if (!context) {
    return (text) => text.length * fontSize * 0.55;
  }
  context.font = `${fontSize}px sans-serif`;
  return (text) => context.measureText(text).width;
}
