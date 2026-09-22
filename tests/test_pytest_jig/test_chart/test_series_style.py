import pytest
from pydantic import ValidationError

from jig import Chart, LineDash, MarkerSymbol, SeriesMode, SeriesStyle


def test_given_a_styled_series_when_added_then_the_style_sits_next_to_its_series():
    chart = Chart()

    chart.add_series(
        x_data=[0.0, 1.0],
        y_data=[0.0, 1.0],
        marker_name="Shots",
        style=SeriesStyle(
            mode=SeriesMode.MARKERS,
            marker_symbol=MarkerSymbol.CIRCLE_OPEN,
            marker_size=9,
            color="#c02020",
        ),
    )

    assert chart.series_style == [
        SeriesStyle(
            mode=SeriesMode.MARKERS,
            marker_symbol=MarkerSymbol.CIRCLE_OPEN,
            marker_size=9,
            color="#c02020",
        ),
    ]


def test_given_plain_series_before_a_styled_one_when_added_then_they_stay_unstyled():
    chart = Chart()
    chart.add_series(x_data=[1, 2], y_data=[1, 2], marker_name="a")
    chart.add_series(x_data=[1, 2], y_data=[3, 4], marker_name="b")

    chart.add_series(
        x_data=[1, 2],
        y_data=[5, 6],
        marker_name="c",
        style=SeriesStyle(line_dash=LineDash.DASH),
    )

    assert chart.series_style == [None, None, SeriesStyle(line_dash=LineDash.DASH)]


def test_given_only_plain_series_when_added_then_no_style_list_is_kept():
    chart = Chart()

    chart.add_series(x_data=[1, 2], y_data=[1, 2], marker_name="a")
    chart.add_series(x_data=[1, 2], y_data=[3, 4], marker_name="b")

    assert chart.series_style == []


def test_given_a_plain_series_after_a_styled_one_when_added_then_it_is_unstyled():
    chart = Chart()
    chart.add_series(
        x_data=[1, 2],
        y_data=[1, 2],
        style=SeriesStyle(mode=SeriesMode.LINES),
    )

    chart.add_series(x_data=[1, 2], y_data=[3, 4])

    assert chart.series_style == [SeriesStyle(mode=SeriesMode.LINES), None]


def test_given_gaps_when_a_series_is_added_then_disjoint_segments_are_one_series():
    chart = Chart()

    chart.add_series(
        x_data=[0, 1, None, 5, 6],
        y_data=[0, 1, None, 5, 6],
        marker_name="Vectors",
    )

    assert chart.x_data == [[0, 1, None, 5, 6]]
    assert chart.y_data == [[0, 1, None, 5, 6]]


def test_given_a_gap_in_one_coordinate_only_when_added_then_it_is_refused():
    chart = Chart()

    with pytest.raises(ValueError, match="None in both x_data and y_data"):
        chart.add_series(x_data=[0, None, 2], y_data=[0, 1, 2])


def test_given_a_series_of_gaps_only_when_added_then_it_is_refused():
    chart = Chart()

    with pytest.raises(ValueError, match="at least one point that is not None"):
        chart.add_series(x_data=[None, None], y_data=[None, None])


def test_given_hover_text_for_some_points_only_when_added_then_it_is_refused():
    chart = Chart()

    with pytest.raises(ValueError, match="hover_text must have one entry per point"):
        chart.add_series(
            x_data=[1, 2, 3],
            y_data=[1, 2, 3],
            style=SeriesStyle(hover_text=["a", "b"]),
        )


def test_given_colour_values_for_some_points_only_when_added_then_it_is_refused():
    chart = Chart()

    with pytest.raises(
        ValueError,
        match="color_values must have one entry per point",
    ):
        chart.add_series(
            x_data=[1, 2, 3],
            y_data=[1, 2, 3],
            style=SeriesStyle(color_values=[0.1, 0.2]),
        )


def test_given_a_fixed_colour_and_colour_values_when_styled_then_it_is_refused():
    with pytest.raises(ValidationError, match="cannot both be set"):
        SeriesStyle(color="red", color_values=[1.0, 2.0])


def test_given_a_colour_bar_title_without_values_when_styled_then_it_is_refused():
    with pytest.raises(ValidationError, match="colorbar_title requires color_values"):
        SeriesStyle(colorbar_title="Error (um)")


def test_given_out_of_range_style_numbers_when_styled_then_they_are_refused():
    with pytest.raises(ValidationError):
        SeriesStyle(marker_size=0)
    with pytest.raises(ValidationError):
        SeriesStyle(line_width=0.0)
    with pytest.raises(ValidationError):
        SeriesStyle(opacity=1.5)


def test_given_styles_for_some_series_only_when_the_chart_is_built_then_it_is_refused():
    with pytest.raises(ValidationError, match="one entry per series"):
        Chart(
            marker_name=["a", "b"],
            x_data=[[1], [2]],
            y_data=[[1], [2]],
            series_style=[SeriesStyle(mode=SeriesMode.LINES)],
        )


def test_given_a_styled_chart_when_written_for_the_document_then_it_is_plain_json():
    chart = Chart(title="Shots on the screen", equal_aspect=True)
    chart.add_series(
        x_data=[0.0, None, 1.0],
        y_data=[0.0, None, 1.0],
        marker_name="Vectors",
        style=SeriesStyle(mode=SeriesMode.LINES, line_dash=LineDash.DOT),
    )
    chart.add_series(x_data=[2.0], y_data=[2.0], marker_name="Screen")

    document = chart.to_dict()

    assert document == {
        "type": "line",
        "title": "Shots on the screen",
        "marker_name": ["Vectors", "Screen"],
        "x_data": [[0.0, None, 1.0], [2.0]],
        "y_data": [[0.0, None, 1.0], [2.0]],
        "series_style": [
            {
                "mode": "lines",
                "color": None,
                "marker_symbol": None,
                "marker_size": None,
                "line_dash": "dot",
                "line_width": None,
                "opacity": None,
                "hover_text": None,
                "color_values": None,
                "colorbar_title": None,
                "show_legend": True,
            },
            None,
        ],
        "equal_aspect": True,
    }


def test_given_a_plain_chart_when_written_for_the_document_then_it_stays_plain():
    chart = Chart(title="Current")
    chart.add_series(x_data=[1, 2], y_data=[3, 4], marker_name="Inrush")

    assert chart.to_dict() == {
        "type": "line",
        "title": "Current",
        "marker_name": ["Inrush"],
        "x_data": [[1, 2]],
        "y_data": [[3, 4]],
        "series_style": [],
        "equal_aspect": False,
    }
