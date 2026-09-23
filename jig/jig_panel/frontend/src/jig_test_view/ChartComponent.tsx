// Copyright (c) 2025 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import React, { useState, useRef, useEffect } from "react";
import { Dialog, Button, Classes } from "@blueprintjs/core";
import Plot from "react-plotly.js";
import { withTranslation, WithTranslation } from "react-i18next";

import {
  TITLE_PADDING,
  frameChart,
  textMeasurer,
  type ChartFrame,
} from "@/lib/chartLayout";
import {
  equalAspectAxis,
  toPlotlyTrace,
  type ChartSeries,
} from "@/lib/chartSeries";

/** Header and padding of the fullscreen dialog around its chart, in pixels. */
const MODAL_CHROME_HEIGHT = 70;

/**
 * Interface representing chart data structure
 * @interface ChartData
 * @property {(number | null)[]} x_data - Array of x-axis data points, null for a gap
 * @property {(number | null)[]} y_data - Array of y-axis data points, null for a gap
 * @property {string} marker_name - Name/label for the data series
 * @property {SeriesStyle | null} [style] - How the series is drawn, defaults when absent
 * @property {string} [x_label] - Optional label for x-axis
 * @property {string} [y_label] - Optional label for y-axis
 * @property {string} [chart_title] - Optional title for the chart
 */
interface ChartData extends ChartSeries {
  x_label?: string;
  y_label?: string;
  chart_title?: string;
}

/**
 * Props interface for ChartComponent
 * @interface ChartComponentProps
 * @extends {WithTranslation}
 * @property {ChartData[]} charts - Array of chart data objects
 * @property {boolean} [isCollapsed] - Whether the chart is currently collapsed
 * @property {() => void} [onToggleCollapse] - Callback function to toggle collapse state
 * @property {string} [title] - Optional chart title (overrides data title)
 * @property {string} [xLabel] - Optional x-axis label (overrides data label)
 * @property {string} [yLabel] - Optional y-axis label (overrides data label)
 * @property {string} [chartType] - Type of chart visualization
 * @property {number} [containerWidth] - Optional fixed container width
 * @property {boolean} [equalAspect] - Draw one unit of X as long as one unit of Y
 */
interface ChartComponentProps extends WithTranslation {
  charts: ChartData[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  chartType?: string;
  containerWidth?: number;
  equalAspect?: boolean;
}

/**
 * Constants for chart configuration and styling. Sizes and margins come from
 * `chartLayout`, which frames a chart from its width and its data.
 * @constant
 * @property {number} COLLAPSED_MIN_WIDTH - Minimum width when chart is collapsed
 * @property {number} COLLAPSED_MIN_HEIGHT - Minimum height when chart is collapsed
 * @property {number} BORDER_RADIUS - Border radius for chart container
 * @property {number} PADDING - Internal padding for chart container
 * @property {Object} MARGIN - Plotly chart margin padding
 * @property {number} MODAL_SIZE - Size ratio for fullscreen modal (0-1)
 * @property {Object} MARKER - Marker styling configuration
 * @property {number} LINE_WIDTH - Line width for chart series
 * @property {Object} FONT_SIZES - Font size configuration for different elements
 * @property {Object} COLORS - Color scheme configuration
 * @property {Object} Z_INDEX - Z-index values for layered elements
 */
const CHART_CONSTANTS = {
  COLLAPSED_MIN_WIDTH: 150,
  COLLAPSED_MIN_HEIGHT: 200,
  BORDER_RADIUS: 3,
  PADDING: 10,
  MARGIN: {
    PAD: 4,
  },
  MODAL_SIZE: 0.9,
  MARKER: {
    SIZE: 8,
    LINE_WIDTH: 1,
  },
  LINE_WIDTH: 2,
  FONT_SIZES: {
    TITLE: 16,
    AXIS: 12,
    MODAL_TITLE: 20,
    MODAL_AXIS: 14,
  },
  COLORS: {
    GRID: "#eee",
    BACKGROUND: "#f9f9f9",
    PAPER: "#fff",
    COLLAPSED_BACKGROUND: "#f5f5f5",
    BORDER: "#ccc",
    LEGEND_BACKGROUND: "rgba(255, 255, 255, 0.8)",
    LEGEND_BORDER: "#ccc",
  },
  Z_INDEX: {
    CONTROLS: 100,
  },
} as const;

/**
 * Array of marker symbols for differentiating data series
 * @constant
 * @type {string[]}
 */
const MARKER_SYMBOLS = [
  "circle",
  "square",
  "diamond",
  "cross",
  "x",
  "triangle-up",
  "triangle-down",
  "triangle-left",
  "triangle-right",
  "pentagon",
  "hexagon",
  "hexagon2",
  "octagon",
  "star",
  "hexagram",
  "star-triangle-up",
  "star-triangle-down",
  "star-square",
  "star-diamond",
  "diamond-tall",
];

/**
 * React component for displaying interactive charts with multiple data series
 * @component
 * @param {ChartComponentProps} props - Component properties
 * @returns {JSX.Element} Rendered chart component
 */
const ChartComponent: React.FC<ChartComponentProps> = ({
  charts,
  isCollapsed = false,
  onToggleCollapse,
  title,
  xLabel,
  yLabel,
  chartType = "line",
  containerWidth,
  equalAspect = false,
  t,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  /**
   * Follows the width of the chart's own container, so the plot fills the
   * column it is in whatever the table measured for it, and keeps up when
   * the column is resized or a section is unfolded.
   */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }
    const measure = () => setMeasuredWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isCollapsed]);

  const availableWidth =
    (measuredWidth || containerWidth || 0) - 2 * CHART_CONSTANTS.PADDING;

  /**
   * Determines the axis type based on chart type configuration
   * @param {"x" | "y"} axis - Which axis to get type for
   * @returns {"linear" | "log"} The axis scale type
   */
  const getAxisType = (axis: "x" | "y") => {
    switch (chartType) {
      case "line_log_x":
        return axis === "x" ? "log" : "linear";
      case "line_log_y":
        return axis === "y" ? "log" : "linear";
      case "log_x_y":
        return "log";
      default:
        return "linear";
    }
  };

  // Determine chart title and labels with fallback logic
  const chartTitle =
    title || (charts.length > 0 ? charts[0].chart_title : undefined);
  const xAxisLabel =
    xLabel || (charts.length > 0 ? charts[0].x_label : undefined);
  const yAxisLabel =
    yLabel || (charts.length > 0 ? charts[0].y_label : undefined);

  /**
   * Transforms chart data into Plotly-compatible format. An unstyled series
   * takes the colour and symbol of its position; a style overrides only what
   * it sets.
   * @type {Array<Object>}
   */
  const plotData = charts.map((chart, index) =>
    toPlotlyTrace(chart, {
      color: `hsl(${(index * 360) / charts.length}, 70%, 50%)`,
      markerLineColor: `hsl(${(index * 360) / charts.length}, 70%, 30%)`,
      symbol: MARKER_SYMBOLS[index % MARKER_SYMBOLS.length],
      markerSize: CHART_CONSTANTS.MARKER.SIZE,
      markerLineWidth: CHART_CONSTANTS.MARKER.LINE_WIDTH,
      lineWidth: CHART_CONSTANTS.LINE_WIDTH,
    }),
  );

  const legendNames = charts.map((chart) => chart.marker_name);

  /**
   * Lays the chart out in the frame that fits its data at a given size: the
   * title wrapped and given room, the legend under the axes in room of its
   * own, the height following the data on equal axes.
   * @param {ChartFrame} frame - The frame to lay out in.
   * @param {number} titleFontSize - Title font size, in pixels.
   * @param {number} axisFontSize - Axis title font size, in pixels.
   * @returns {Record<string, unknown>} A Plotly layout.
   */
  const layoutIn = (
    frame: ChartFrame,
    titleFontSize: number,
    axisFontSize: number,
  ): Record<string, unknown> => ({
    width: frame.width,
    height: frame.height,
    title: frame.title
      ? {
          text: frame.title,
          x: 0.5,
          xanchor: "center",
          y: 1,
          yanchor: "top",
          yref: "container",
          pad: { t: TITLE_PADDING },
          font: { size: titleFontSize, weight: "bold" },
        }
      : undefined,
    xaxis: {
      title: xAxisLabel
        ? { text: xAxisLabel, font: { size: axisFontSize, weight: "bold" } }
        : undefined,
      type: getAxisType("x"),
      showgrid: true,
      gridcolor: CHART_CONSTANTS.COLORS.GRID,
      zeroline: false,
      automargin: true,
    },
    yaxis: {
      title: yAxisLabel
        ? { text: yAxisLabel, font: { size: axisFontSize, weight: "bold" } }
        : undefined,
      type: getAxisType("y"),
      showgrid: true,
      gridcolor: CHART_CONSTANTS.COLORS.GRID,
      zeroline: false,
      automargin: true,
      ...equalAspectAxis(equalAspect),
    },
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      xanchor: "left",
      y: frame.legendY,
      yanchor: "top",
      bgcolor: CHART_CONSTANTS.COLORS.LEGEND_BACKGROUND,
      bordercolor: CHART_CONSTANTS.COLORS.LEGEND_BORDER,
      borderwidth: 1,
    },
    margin: { ...frame.margin, pad: CHART_CONSTANTS.MARGIN.PAD },
    hovermode: "closest",
    plot_bgcolor: CHART_CONSTANTS.COLORS.BACKGROUND,
    paper_bgcolor: CHART_CONSTANTS.COLORS.PAPER,
  });

  const layout = layoutIn(
    frameChart({
      width: availableWidth,
      equalAspect,
      series: charts,
      title: chartTitle,
      legendNames,
      titleFontSize: CHART_CONSTANTS.FONT_SIZES.TITLE,
      legendFontSize: CHART_CONSTANTS.FONT_SIZES.AXIS,
      measure: textMeasurer(CHART_CONSTANTS.FONT_SIZES.TITLE),
    }),
    CHART_CONSTANTS.FONT_SIZES.TITLE,
    CHART_CONSTANTS.FONT_SIZES.AXIS,
  );

  const fullScreenLayout = layoutIn(
    frameChart({
      width: window.innerWidth * CHART_CONSTANTS.MODAL_SIZE - 2 * CHART_CONSTANTS.PADDING,
      height:
        window.innerHeight * CHART_CONSTANTS.MODAL_SIZE - MODAL_CHROME_HEIGHT,
      equalAspect,
      series: charts,
      title: chartTitle,
      legendNames,
      titleFontSize: CHART_CONSTANTS.FONT_SIZES.MODAL_TITLE,
      legendFontSize: CHART_CONSTANTS.FONT_SIZES.MODAL_AXIS,
      measure: textMeasurer(CHART_CONSTANTS.FONT_SIZES.MODAL_TITLE),
    }),
    CHART_CONSTANTS.FONT_SIZES.MODAL_TITLE,
    CHART_CONSTANTS.FONT_SIZES.MODAL_AXIS,
  );

  // Render collapsed state if isCollapsed is true
  if (isCollapsed) {
    return (
      <div
        style={{
          border: `1px solid ${CHART_CONSTANTS.COLORS.BORDER}`,
          padding: `${CHART_CONSTANTS.PADDING}px`,
          borderRadius: `${CHART_CONSTANTS.BORDER_RADIUS}px`,
          background: CHART_CONSTANTS.COLORS.COLLAPSED_BACKGROUND,
          display: "inline-block",
          minWidth: `${CHART_CONSTANTS.COLLAPSED_MIN_WIDTH}px`,
          maxWidth: "100%",
        }}
      >
      <Button icon="chevron-down" onClick={onToggleCollapse} minimal small>
        {t("chart.showChart", {
          title: chartTitle || "",
        })}
      </Button>
      </div>
    );
  }

  // Render expanded chart with fullscreen modal capability
  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: `1px solid ${CHART_CONSTANTS.COLORS.BORDER}`,
          padding: `${CHART_CONSTANTS.PADDING}px`,
          borderRadius: `${CHART_CONSTANTS.BORDER_RADIUS}px`,
          width: "100%",
          minWidth: `${CHART_CONSTANTS.COLLAPSED_MIN_WIDTH}px`,
          minHeight: `${CHART_CONSTANTS.COLLAPSED_MIN_HEIGHT}px`,
          overflow: "hidden",
          boxSizing: "border-box",
          background: CHART_CONSTANTS.COLORS.PAPER,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `${CHART_CONSTANTS.PADDING}px`,
            right: `${CHART_CONSTANTS.PADDING}px`,
            zIndex: CHART_CONSTANTS.Z_INDEX.CONTROLS,
          }}
        >
          <Button
            icon="fullscreen"
            onClick={() => setIsModalOpen(true)}
            minimal
            small
            style={{ marginRight: "5px" }}
            title={t("chart.fullscreenButton")}
          />
          <Button icon="chevron-up" onClick={onToggleCollapse} minimal small />
        </div>
        <div style={{ width: "100%", height: "100%" }}>
          <Plot
            data={plotData}
            layout={layout}
            config={{
              displayModeBar: false,
              displaylogo: false,
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={chartTitle}
        className="chart-modal"
        style={{
          width: "90vw",
          height: "90vh",
          padding: `${CHART_CONSTANTS.PADDING}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          className={Classes.DIALOG_BODY}
          style={{
            height: "calc(100% - 50px)",
            padding: "0",
            margin: "0",
          }}
        >
          <Plot
            data={plotData}
            layout={fullScreenLayout}
            config={{
              displayModeBar: true,
              displaylogo: false,
              responsive: true,
              modeBarButtonsToAdd: ["toggleHover", "resetScale2d"],
              modeBarButtonsToRemove: [
                "pan2d",
                "select2d",
                "lasso2d",
                "autoScale2d",
              ],
            }}
            style={{ display: "block", margin: "0 auto" }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default withTranslation()(ChartComponent);
