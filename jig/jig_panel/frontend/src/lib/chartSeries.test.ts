// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import { describe, expect, test } from "vitest";

import {
  equalAspectAxis,
  toPlotlyTrace,
  type SeriesDefaults,
} from "./chartSeries";

const defaults: SeriesDefaults = {
  color: "hsl(0, 70%, 50%)",
  markerLineColor: "hsl(0, 70%, 30%)",
  symbol: "circle",
  markerSize: 8,
  markerLineWidth: 1,
  lineWidth: 2,
};

describe("toPlotlyTrace", () => {
  test(`given a series without a style,
 when turned into a trace,
 then it is a line with markers in the panel's colour and shape`, () => {
    const trace = toPlotlyTrace(
      { x_data: [1, 2], y_data: [3, 4], marker_name: "Inrush" },
      defaults,
    );

    expect(trace).toEqual({
      x: [1, 2],
      y: [3, 4],
      type: "scatter",
      mode: "lines+markers",
      name: "Inrush",
      showlegend: true,
      marker: {
        color: "hsl(0, 70%, 50%)",
        symbol: "circle",
        size: 8,
        line: { width: 1, color: "hsl(0, 70%, 30%)" },
      },
      line: { width: 2, dash: "solid", color: "hsl(0, 70%, 50%)" },
    });
  });

  test(`given a null style,
 when turned into a trace,
 then it is drawn like an unstyled series`, () => {
    const unstyled = toPlotlyTrace(
      { x_data: [1], y_data: [2], marker_name: "a" },
      defaults,
    );
    const nullStyled = toPlotlyTrace(
      { x_data: [1], y_data: [2], marker_name: "a", style: null },
      defaults,
    );

    expect(nullStyled).toEqual(unstyled);
  });

  test(`given markers only with an open symbol and a colour,
 when turned into a trace,
 then the line is dropped and the colour is used for marker and outline`, () => {
    const trace = toPlotlyTrace(
      {
        x_data: [1, 2],
        y_data: [3, 4],
        marker_name: "Aimed",
        style: {
          mode: "markers",
          marker_symbol: "circle-open",
          marker_size: 12,
          color: "#888888",
        },
      },
      defaults,
    );

    expect(trace.mode).toBe("markers");
    expect(trace.marker).toEqual({
      color: "#888888",
      symbol: "circle-open",
      size: 12,
      line: { width: 1, color: "#888888" },
    });
    expect(trace.line).toEqual({ width: 2, dash: "solid", color: "#888888" });
  });

  test(`given a dashed line without markers,
 when turned into a trace,
 then the dash and width reach the line`, () => {
    const trace = toPlotlyTrace(
      {
        x_data: [-1, 1, 1, -1, -1],
        y_data: [-1, -1, 1, 1, -1],
        marker_name: "Screen",
        style: { mode: "lines", line_dash: "dash", line_width: 1.5 },
      },
      defaults,
    );

    expect(trace.mode).toBe("lines");
    expect(trace.line).toEqual({
      width: 1.5,
      dash: "dash",
      color: "hsl(0, 70%, 50%)",
    });
  });

  test(`given a value per point,
 when turned into a trace,
 then the markers are coloured on a scale with a titled colour bar`, () => {
    const trace = toPlotlyTrace(
      {
        x_data: [1, 2, 3],
        y_data: [1, 2, 3],
        marker_name: "Shots",
        style: {
          mode: "markers",
          color_values: [0.5, 1.5, 3.0],
          colorbar_title: "Radial error (um)",
        },
      },
      defaults,
    );

    expect(trace.marker).toEqual({
      color: [0.5, 1.5, 3.0],
      symbol: "circle",
      size: 8,
      line: { width: 1, color: "hsl(0, 70%, 30%)" },
      colorscale: "Viridis",
      showscale: true,
      colorbar: { title: { text: "Radial error (um)" }, thickness: 12, len: 0.8 },
    });
  });

  test(`given hover text per point,
 when turned into a trace,
 then hovering shows that text and the series name`, () => {
    const trace = toPlotlyTrace(
      {
        x_data: [1, 2],
        y_data: [1, 2],
        marker_name: "Shots",
        style: { hover_text: ["aimed (0, 0)", "aimed (10, 0)"] },
      },
      defaults,
    );

    expect(trace.text).toEqual(["aimed (0, 0)", "aimed (10, 0)"]);
    expect(trace.hoverinfo).toBe("text+name");
  });

  test(`given a series kept out of the legend with an opacity,
 when turned into a trace,
 then both settings reach the trace`, () => {
    const trace = toPlotlyTrace(
      {
        x_data: [1, null, 2],
        y_data: [1, null, 2],
        marker_name: "Vectors",
        style: { show_legend: false, opacity: 0.4 },
      },
      defaults,
    );

    expect(trace.showlegend).toBe(false);
    expect(trace.opacity).toBe(0.4);
    expect(trace.x).toEqual([1, null, 2]);
  });
});

describe("equalAspectAxis", () => {
  test(`given a chart of positions,
 when the axis is laid out,
 then Y is anchored to X one to one`, () => {
    expect(equalAspectAxis(true)).toEqual({ scaleanchor: "x", scaleratio: 1 });
  });

  test(`given an ordinary chart,
 when the axis is laid out,
 then nothing is added`, () => {
    expect(equalAspectAxis(false)).toEqual({});
  });
});
