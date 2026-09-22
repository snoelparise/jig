# Chart

This is an example of how charts can be saved in tests.

The [set_case_chart](./../documentation/pytest_jig.md#set_case_chart) function allows 
to save chart (data series) result to database.

### how to start

1. Launch `jig init charts`.
2. Launch [CouchDB instance](../documentation/database.md#couchdb-instance).
3. Modify the files described below.
4. Launch `jig run charts`.

### test_1.py

```python
import pytest

from jig import Chart, ChartType, set_case_chart

pytestmark = pytest.mark.module_name("Charts")

@pytest.mark.case_name("Line chart")
def test_line_chart():
    chart = Chart(
        type=ChartType.LINE,
        title="title",
        x_label="x_label",
        y_label="y_label",
        marker_name=[None, None],
        x_data=[ [1, 2], [1, 2] ],
        y_data=[ [3, 4], [3, 4] ],
    )
    set_case_chart(chart)

@pytest.mark.case_name("Multiple charts")
def test_multiple_charts():
    chart = Chart()
    chart.add_series(x_data=[1, 2, 3], y_data=[1, 2, 3], marker_name="a")
    chart.add_series(x_data=[1, 2, 4], y_data=[5, 4, 3], marker_name="b")
    set_case_chart(chart)

@pytest.mark.case_name("Line chart with logarithmic X axis")
def test_line_log_x():
    chart = Chart(
        type=ChartType.LINE_LOG_X,
        title="Logarithmic X Axis",
        x_label="Log X",
        y_label="Linear Y",
    )
    x_data = [10**i for i in range(5)]
    y_data = [i**2 for i in range(5)]
    chart.add_series(x_data=x_data, y_data=y_data, marker_name="Quadratic")
    set_case_chart(chart)


@pytest.mark.case_name("Line chart with logarithmic Y axis")
def test_line_log_y():
    chart = Chart(
        type=ChartType.LINE_LOG_Y,
        title="Logarithmic Y Axis",
        x_label="Linear X",
        y_label="Log Y",
    )
    x_data = list(range(1, 6))
    y_data = [10**i for i in range(5)]
    chart.add_series(x_data=x_data, y_data=y_data, marker_name="Exponential")
    set_case_chart(chart)


@pytest.mark.case_name("Double logarithmic chart")
def test_log_x_y():
    chart = Chart(
        type=ChartType.LOG_X_Y,
        title="Double Logarithmic Plot",
        x_label="Log X",
        y_label="Log Y",
    )
    x_data = [10**i for i in range(1, 6)]
    y_data = [10**i for i in range(1, 6)]
    chart.add_series(x_data=x_data, y_data=y_data, marker_name="Linear in log-log")
    set_case_chart(chart)    
```

### test_2_styled.py

A chart of positions rather than of a quantity over another. Each series
carries a [SeriesStyle](./../documentation/pytest_jig.md#seriesstyle): the
field is a dashed outline, the aimed positions are open circles, the landings
are markers coloured by how far they are off, with a colour bar and a hover
label per point, and one series draws every aimed-to-landed segment by
breaking its line with `None`. `equal_aspect` keeps the square field square.

```python
import pytest

from jig import Chart, LineDash, MarkerSymbol, SeriesMode, SeriesStyle, set_case_chart

pytestmark = pytest.mark.module_name("Styled charts")

AIMED = [(-100.0, 0.0), (0.0, 0.0), (100.0, 0.0)]
LANDED = [(-104.0, 1.0), (0.5, -0.5), (103.0, 2.0)]

@pytest.mark.case_name("Landing map")
def test_landing_map():
    errors = [((lx - ax) ** 2 + (ly - ay) ** 2) ** 0.5 for (ax, ay), (lx, ly) in zip(AIMED, LANDED)]

    chart = Chart(title="Where the shots landed", x_label="X, um", y_label="Y, um", equal_aspect=True)
    chart.add_series(
        [-150.0, 150.0, 150.0, -150.0, -150.0],
        [-50.0, -50.0, 50.0, 50.0, -50.0],
        "Field",
        style=SeriesStyle(mode=SeriesMode.LINES, line_dash=LineDash.DASH, color="#888888"),
    )
    vector_x, vector_y = [], []
    for (ax, ay), (lx, ly) in zip(AIMED, LANDED):
        vector_x.extend([ax, lx, None])
        vector_y.extend([ay, ly, None])
    chart.add_series(
        vector_x, vector_y, "Deviation",
        style=SeriesStyle(mode=SeriesMode.LINES, color="#c02020", show_legend=False),
    )
    chart.add_series(
        [x for x, _ in AIMED], [y for _, y in AIMED], "Aimed",
        style=SeriesStyle(mode=SeriesMode.MARKERS, marker_symbol=MarkerSymbol.CIRCLE_OPEN, color="#888888"),
    )
    chart.add_series(
        [x for x, _ in LANDED], [y for _, y in LANDED], "Landed",
        style=SeriesStyle(
            mode=SeriesMode.MARKERS,
            marker_size=10,
            color_values=errors,
            colorbar_title="Radial error, um",
            hover_text=[f"aimed ({ax:g}, {ay:g}), off by {e:.1f} um" for (ax, ay), e in zip(AIMED, errors)],
        ),
    )
    set_case_chart(chart)
```
