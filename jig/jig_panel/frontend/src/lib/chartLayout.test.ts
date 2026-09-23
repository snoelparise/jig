// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import { describe, expect, test } from "vitest";

import {
  dataSpans,
  frameChart,
  legendRowCount,
  wrapTitle,
} from "./chartLayout";

/** Ten pixels per character: widths in the tests below read as character counts. */
const tenPerCharacter = (text: string) => text.length * 10;

describe("dataSpans", () => {
  test(`given series with gaps,
 when the spans are taken,
 then the gaps are ignored and each span is the extent of the data`, () => {
    expect(
      dataSpans([
        { x_data: [-300, null, 300], y_data: [-100, null, 100], marker_name: "a" },
        { x_data: [0], y_data: [250], marker_name: "b" },
      ]),
    ).toEqual({ x: 600, y: 350 });
  });

  test(`given a single point,
 when the spans are taken,
 then each span is 1 rather than 0`, () => {
    expect(
      dataSpans([{ x_data: [5], y_data: [5], marker_name: "a" }]),
    ).toEqual({ x: 1, y: 1 });
  });
});

describe("wrapTitle", () => {
  test(`given a title wider than the line,
 when wrapped,
 then it breaks at spaces into lines that fit`, () => {
    expect(
      wrapTitle("Grid burned through galvo calibration 3", 200, tenPerCharacter),
    ).toBe("Grid burned through<br>galvo calibration 3");
  });

  test(`given a title that fits,
 when wrapped,
 then it is unchanged`, () => {
    expect(wrapTitle("Startup current", 200, tenPerCharacter)).toBe(
      "Startup current",
    );
  });

  test(`given a word wider than the line,
 when wrapped,
 then the word stays whole on its own line`, () => {
    expect(
      wrapTitle("Run 0123456789abcdef0123456789 done", 150, tenPerCharacter),
    ).toBe("Run<br>0123456789abcdef0123456789<br>done");
  });
});

describe("legendRowCount", () => {
  test(`given entries that fit on one row,
 when counted,
 then there is one row`, () => {
    // 2 entries of (5 characters * 10 + 44 padding) = 188 px in 400 px.
    expect(legendRowCount(["Shots", "Aimed"], 400, tenPerCharacter)).toBe(1);
  });

  test(`given entries wider than the plot,
 when counted,
 then they wrap onto more rows`, () => {
    // Each entry is 94 px; three fit in 300 px, the fourth and fifth wrap.
    expect(
      legendRowCount(["Shots", "Aimed", "Frame", "Limit", "Misss"], 300, tenPerCharacter),
    ).toBe(2);
  });

  test(`given no entries,
 when counted,
 then there is no row`, () => {
    expect(legendRowCount([], 400, tenPerCharacter)).toBe(0);
  });
});

describe("frameChart", () => {
  test(`given an ordinary chart in a 600 px container,
 when framed,
 then it fills the width, keeps the plot band, and reserves room under the
 axes for one legend row`, () => {
    const frame = frameChart({
      width: 600,
      equalAspect: false,
      series: [{ x_data: [0, 1], y_data: [0, 100], marker_name: "Inrush" }],
      title: "Startup current",
      legendNames: ["Inrush"],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });

    expect(frame.width).toBe(600);
    expect(frame.title).toBe("Startup current");
    // Title: 2 * 12 padding + one line of 16 * 1.4.
    expect(frame.margin).toEqual({ l: 75, r: 30, t: 46, b: 90 });
    // Top + 180 plot band + bottom.
    expect(frame.height).toBe(316);
    // The legend top sits 62 px under a 180 px plot area.
    expect(frame.legendY).toBeCloseTo(-62 / 180);
  });

  test(`given a map of a screen wider than tall,
 when framed on equal axes,
 then the plot area takes the height of the data at the plot's width`, () => {
    const frame = frameChart({
      width: 600,
      equalAspect: true,
      series: [
        {
          x_data: [-1500, 1500, 1500, -1500, -1500],
          y_data: [-1000, -1000, 1000, 1000, -1000],
          marker_name: "Screen",
        },
      ],
      title: undefined,
      legendNames: ["Screen"],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });

    // Plot width 600 - 75 - 30 = 495; height 495 * 2000 / 3000 = 330.
    expect(frame.margin.t).toBe(24);
    expect(frame.height).toBe(24 + 330 + 90);
    expect(frame.legendY).toBeCloseTo(-62 / 330);
    expect(frame.title).toBe("");
  });

  test(`given a map much taller than wide,
 when framed on equal axes,
 then the plot height is capped rather than growing without bound`, () => {
    const frame = frameChart({
      width: 600,
      equalAspect: true,
      series: [{ x_data: [0, 10], y_data: [0, 10000], marker_name: "a" }],
      legendNames: ["a"],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });

    // Capped at 1.25 * 495 = 618.75 (below the 700 px ceiling).
    expect(frame.height).toBe(Math.round(24 + 618.75 + 90));
  });

  test(`given a height to fill,
 when an ordinary chart is framed,
 then the plot band grows to fill it`, () => {
    const frame = frameChart({
      width: 1200,
      height: 800,
      equalAspect: false,
      series: [{ x_data: [0, 1], y_data: [0, 1], marker_name: "a" }],
      title: "Startup current",
      legendNames: ["a"],
      titleFontSize: 20,
      legendFontSize: 14,
      measure: tenPerCharacter,
    });

    expect(frame.height).toBe(800);
    // Top: 24 + 20 * 1.4 = 52; bottom: 62 + 6 + 22 = 90; plot: 658.
    expect(frame.legendY).toBeCloseTo(-62 / 658);
  });

  test(`given a height to fill,
 when a wide map is framed on equal axes,
 then its plot keeps the data's height rather than stretching`, () => {
    const frame = frameChart({
      width: 1200,
      height: 800,
      equalAspect: true,
      series: [{ x_data: [0, 3000], y_data: [0, 1000], marker_name: "a" }],
      legendNames: ["a"],
      titleFontSize: 20,
      legendFontSize: 14,
      measure: tenPerCharacter,
    });

    // Plot width 1095; natural height 365, well under the 686 available.
    expect(frame.height).toBe(24 + 365 + 90);
  });

  test(`given a narrow container,
 when framed,
 then the chart keeps its minimum width and wraps the title to it`, () => {
    const frame = frameChart({
      width: 100,
      equalAspect: false,
      series: [{ x_data: [0], y_data: [0], marker_name: "a" }],
      title: "Grid burned through galvo calibration 3",
      legendNames: ["a"],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });

    expect(frame.width).toBe(250);
    // Plot width 145: at most 14 characters per line.
    expect(frame.title).toBe("Grid burned<br>through galvo<br>calibration 3");
    expect(frame.margin.t).toBe(Math.round(24 + 3 * 16 * 1.4));
  });

  test(`given many long legend entries,
 when framed,
 then the bottom margin grows by one row height per extra row`, () => {
    const oneRow = frameChart({
      width: 600,
      equalAspect: false,
      series: [{ x_data: [0], y_data: [0], marker_name: "a" }],
      legendNames: ["Shots"],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });
    // In 495 px: 374 | 324 | 334 + 144 | 404 -> four rows.
    const fourRows = frameChart({
      width: 600,
      equalAspect: false,
      series: [{ x_data: [0], y_data: [0], marker_name: "a" }],
      legendNames: [
        "Camera frame outline of the field",
        "Limit ring of one micrometre",
        "Miss, drawn one hundred times",
        "Aimed grid",
        "Landed, miss drawn one hundred times",
      ],
      titleFontSize: 16,
      legendFontSize: 12,
      measure: tenPerCharacter,
    });

    expect(fourRows.margin.b - oneRow.margin.b).toBe(3 * 22);
    expect(fourRows.height - oneRow.height).toBe(3 * 22);
  });
});
