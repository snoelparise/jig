"""Charts attached to a test case."""

import pytest
from simulated_device import SimulatedDevice  # type: ignore[import-not-found]

from jig import (
    Chart,
    ChartType,
    ComparisonOperation as CompOp,
    LineDash,
    MarkerSymbol,
    NumericMeasurement,
    SeriesMode,
    SeriesStyle,
    set_case_chart,
    set_case_measurement,
)

pytestmark = pytest.mark.module_name("Charts")

MAX_STARTUP_CURRENT_MA = 60.0
MIN_PASSBAND_GAIN_DB = -1.0
MAX_RADIAL_ERROR_UM = 8.0

# A 3 by 3 grid the scanner was asked to burn, and where each shot landed.
AIMED_UM = [(x, y) for y in (-100.0, 0.0, 100.0) for x in (-100.0, 0.0, 100.0)]
LANDED_UM = [
    (-104.0, -103.0),
    (0.5, -101.5),
    (105.0, -104.0),
    (-101.0, 0.0),
    (0.0, 0.0),
    (101.5, 0.5),
    (-103.5, 102.0),
    (-0.5, 101.0),
    (104.5, 103.5),
]


@pytest.mark.case_name("Startup current")
def test_startup_current(device: SimulatedDevice):
    """Attach a single series chart, one point per sample."""
    times, currents = device.record_startup_current()

    chart = Chart(
        title="Startup current",
        x_label="Time, ms",
        y_label="Current, mA",
        type=ChartType.LINE,
    )
    chart.add_series(times, currents, "Inrush")
    set_case_chart(chart)

    peak_current = max(currents)
    measurement = NumericMeasurement(
        name="Peak startup current",
        value=peak_current,
        unit="mA",
        operation=CompOp.LE,
        comparison_value=MAX_STARTUP_CURRENT_MA,
    )
    set_case_measurement(measurement)

    assert measurement.result, f"Peak current {peak_current:.1f} mA is too high"


@pytest.mark.case_name("Frequency response")
def test_frequency_response(device: SimulatedDevice):
    """Attach a chart with several series and a logarithmic X axis."""
    frequencies, gains = device.sweep_frequency_response()
    tolerance_db = [-3.0] * len(frequencies)

    chart = Chart(
        title="Frequency response",
        x_label="Frequency, Hz",
        y_label="Gain, dB",
        type=ChartType.LINE_LOG_X,
    )
    chart.add_series(frequencies, gains, "Measured")
    chart.add_series(frequencies, tolerance_db, "Tolerance")
    set_case_chart(chart)

    passband_gain = gains[0]
    measurement = NumericMeasurement(
        name="Passband gain",
        value=passband_gain,
        unit="dB",
        operation=CompOp.GE,
        comparison_value=MIN_PASSBAND_GAIN_DB,
    )
    set_case_measurement(measurement)

    assert measurement.result, f"Gain {passband_gain:.2f} dB is too low"


@pytest.mark.case_name("Landing map")
def test_landing_map():
    """Attach a chart of positions: styled series, a colour scale, gaps."""
    errors_um = [
        ((lx - ax) ** 2 + (ly - ay) ** 2) ** 0.5
        for (ax, ay), (lx, ly) in zip(AIMED_UM, LANDED_UM)
    ]

    chart = Chart(
        title="Where the shots landed",
        x_label="X, um",
        y_label="Y, um",
        equal_aspect=True,
    )
    chart.add_series(
        [-150.0, 150.0, 150.0, -150.0, -150.0],
        [-150.0, -150.0, 150.0, 150.0, -150.0],
        "Field",
        style=SeriesStyle(
            mode=SeriesMode.LINES,
            line_dash=LineDash.DASH,
            color="#888888",
        ),
    )
    # One series holds every aimed-to-landed segment: a None breaks the line.
    vector_x: list[float | None] = []
    vector_y: list[float | None] = []
    for (ax, ay), (lx, ly) in zip(AIMED_UM, LANDED_UM):
        vector_x.extend([ax, lx, None])
        vector_y.extend([ay, ly, None])
    chart.add_series(
        vector_x,
        vector_y,
        "Deviation",
        style=SeriesStyle(mode=SeriesMode.LINES, color="#c02020", show_legend=False),
    )
    chart.add_series(
        [x for x, _ in AIMED_UM],
        [y for _, y in AIMED_UM],
        "Aimed",
        style=SeriesStyle(
            mode=SeriesMode.MARKERS,
            marker_symbol=MarkerSymbol.CIRCLE_OPEN,
            color="#888888",
        ),
    )
    chart.add_series(
        [x for x, _ in LANDED_UM],
        [y for _, y in LANDED_UM],
        "Landed",
        style=SeriesStyle(
            mode=SeriesMode.MARKERS,
            marker_size=10,
            color_values=errors_um,
            colorbar_title="Radial error, um",
            hover_text=[
                f"aimed ({ax:g}, {ay:g}), landed ({lx:g}, {ly:g}), off by {err:.1f} um"
                for (ax, ay), (lx, ly), err in zip(AIMED_UM, LANDED_UM, errors_um)
            ],
        ),
    )
    set_case_chart(chart)

    worst_error = max(errors_um)
    measurement = NumericMeasurement(
        name="Largest radial error",
        value=round(worst_error, 2),
        unit="um",
        operation=CompOp.LE,
        comparison_value=MAX_RADIAL_ERROR_UM,
    )
    set_case_measurement(measurement)

    assert measurement.result, f"A shot landed {worst_error:.1f} um off"
