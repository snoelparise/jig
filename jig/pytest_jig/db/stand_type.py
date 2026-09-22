# Copyright (c) 2025 Everypin
# GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

from __future__ import annotations

from pydantic import model_validator

from jig.pytest_jig.db.schema.v1 import (
    Chart as ChartModel,
    Instrument as InstrumentModel,
    NumericMeasurement as NumericMeasurementModel,
    SeriesStyle as SeriesStyleModel,
    StringMeasurement as StringMeasurementModel,
    SubUnit as SubUnitModel,
)
from jig.pytest_jig.utils.const import ComparisonOperation as CompOp


class Instrument(InstrumentModel):
    """Test stand instrument (equipment)."""


class SubUnit(SubUnitModel):
    """Sub unit of DUT."""


class NumericMeasurement(NumericMeasurementModel):
    """Represents a numeric measurement with value and comparison operation.

    Args:
        value (int | float): The value of the measurement.
        name (str | None): The name of the measurement.
        unit (str | None): The unit of the measurement.
        operation (CompOp | None): The comparison operation to apply.
        comparison_value (int | float | None): The value to compare against.
        lower_limit (int | float | None): The lower limit for range operations.
        upper_limit (int | float | None): The upper limit for range operations.
    """

    @model_validator(mode="after")
    def validate_operation_requirements(self) -> NumericMeasurement:
        """Validate field requirements based on selected operation."""
        if (
            self.operation
            in (CompOp.EQ, CompOp.NE, CompOp.GT, CompOp.LT, CompOp.GE, CompOp.LE)
            and self.comparison_value is None
        ):
            msg = f"Comparison_value required for {self.operation} operation"
            raise ValueError(msg)

        if self.operation in (
            CompOp.GTLT,
            CompOp.GELE,
            CompOp.GELT,
            CompOp.GTLE,
            CompOp.LTGT,
            CompOp.LEGE,
            CompOp.LEGT,
            CompOp.LTGE,
        ) and (self.lower_limit is None or self.upper_limit is None):
            msg = "lower_limit and upper_limit required for range operations"
            raise ValueError(msg)

        if self.operation:
            self.result = self._check_condition()

        return self

    def _check_condition(self) -> bool:  # noqa: C901,PLR0912
        """Evaluate the measurement based on the selected operation."""
        res = False
        match self.operation:
            case CompOp.EQ:
                res = self.value == self.comparison_value
            case CompOp.NE:
                res = self.value != self.comparison_value
            case CompOp.GT:
                res = self.value > self.comparison_value
            case CompOp.LT:
                res = self.value < self.comparison_value
            case CompOp.GE:
                res = self.value >= self.comparison_value
            case CompOp.LE:
                res = self.value <= self.comparison_value
            case CompOp.GTLT:
                res = self.value > self.lower_limit and self.value < self.upper_limit
            case CompOp.GELE:
                res = self.value >= self.lower_limit and self.value <= self.upper_limit
            case CompOp.GELT:
                res = self.value >= self.lower_limit and self.value < self.upper_limit
            case CompOp.GTLE:
                res = self.value > self.lower_limit and self.value <= self.upper_limit
            case CompOp.LTGT:
                res = self.value < self.lower_limit or self.value > self.upper_limit
            case CompOp.LEGE:
                res = self.value <= self.lower_limit or self.value >= self.upper_limit
            case CompOp.LEGT:
                res = self.value <= self.lower_limit or self.value > self.upper_limit
            case CompOp.LTGE:
                res = self.value < self.lower_limit or self.value >= self.upper_limit
        return res


class StringMeasurement(StringMeasurementModel):
    """Represents a string measurement with value and comparison operation.

    Args:
        value (str): The value of the measurement.
        name (str | None): The name of the measurement.
        operation (CompOp | None): The comparison operation to apply.
        comparison_value (str | None): The value to compare against.
    """

    @model_validator(mode="after")
    def validate_operation_requirements(self) -> StringMeasurement:
        """Validate field requirements based on selected operation."""
        string_operations = (CompOp.EQ, CompOp.NE)
        if self.operation in string_operations and self.comparison_value is None:
            msg = f"Comparison_value required for {self.operation} operation"
            raise ValueError(msg)

        if self.operation and self.operation not in string_operations:
            msg = f"{self.operation} is not a valid string operation"
            raise ValueError(msg)

        if self.operation:
            self.result = self._check_condition()

        return self

    def _check_condition(self) -> bool:
        """Evaluate the measurement based on the selected operation."""
        res = False
        match self.operation:
            case CompOp.EQ:
                if self.casesensitive:
                    res = self.value == self.comparison_value
                else:
                    res = self.value.lower() == self.comparison_value.lower()
            case CompOp.NE:
                if self.casesensitive:
                    res = self.value != self.comparison_value
                else:
                    res = self.value.lower() != self.comparison_value.lower()
        return res


class SeriesStyle(SeriesStyleModel):
    """How one series of a `Chart` is drawn.

    Args:
        mode (SeriesMode | None): lines, markers, or both (the default).
        color (str | None): one CSS colour for the whole series.
        marker_symbol (MarkerSymbol | None): marker shape.
        marker_size (int | None): marker size in pixels.
        line_dash (LineDash | None): dash pattern of the line.
        line_width (float | None): line width in pixels.
        opacity (float | None): 0 (invisible) to 1 (opaque).
        hover_text (list[str] | None): one label per point, shown on hover.
        color_values (list[int | float] | None): one value per point, drawn
            with a colour scale and a colour bar.
        colorbar_title (str | None): title of that colour bar.
        show_legend (bool): whether the series appears in the legend.
    """

    @model_validator(mode="after")
    def validate_colouring(self) -> SeriesStyle:
        """A series is coloured either as a whole or point by point."""
        if self.color is not None and self.color_values is not None:
            msg = "color and color_values cannot both be set"
            raise ValueError(msg)
        if self.colorbar_title is not None and self.color_values is None:
            msg = "colorbar_title requires color_values"
            raise ValueError(msg)
        return self


class Chart(ChartModel):
    """Represents a chart with data and labels.

    Args:
        type (ChartType | None): chart type.
        title (str | None): chart title.
        x_label (str | None): X label.
        y_label (str | None): Y label.
        equal_aspect (bool): draw one unit of X as long as one unit of Y,
            for charts of positions rather than of a quantity over another.
    """

    @model_validator(mode="after")
    def validate_lines(self) -> Chart:
        """Validate field requirements based on selected operation."""
        self._diff_list_len_validator(self.x_data, self.y_data)
        self._diff_list_len_validator(self.x_data, self.marker_name)
        if self.series_style and len(self.series_style) != len(self.x_data):
            msg = "series_style must be empty or have one entry per series"
            raise ValueError(msg)

        if len(self.x_data):
            for i in range(len(self.x_data)):
                self._diff_list_len_validator(self.x_data[i], self.y_data[i])
                self._empty_list_validator(self.x_data[0])
                self._empty_list_validator(self.marker_name)
                _validate_series_points(self.x_data[i], self.y_data[i])
                style = self.series_style[i] if self.series_style else None
                if style is not None:
                    _validate_style_lengths(style, len(self.x_data[i]))

        return self

    def add_series(
        self,
        x_data: list[int | float | None],
        y_data: list[int | float | None],
        marker_name: str | None = None,
        style: SeriesStyle | None = None,
    ) -> None:
        """Add data series to chart.

        Args:
            x_data (list[int | float | None]): X data. A None breaks the line.
            y_data (list[int | float | None]): Y data. A None breaks the line.
            marker_name (str | None): series marker name.
            style (SeriesStyle | None): how the series is drawn; None keeps
                the panel's defaults.
        """
        self._diff_list_len_validator(x_data, y_data)
        self._empty_list_validator(x_data)
        _validate_series_points(x_data, y_data)
        if style is not None:
            _validate_style_lengths(style, len(x_data))

        # Styles stay either absent or one per series: a chart that was plain
        # so far gets a None for each earlier series the moment one is styled.
        if style is not None or self.series_style:
            unstyled_count = len(self.x_data) - len(self.series_style)
            self.series_style.extend([None] * unstyled_count)
            self.series_style.append(style)

        self.x_data.append(x_data)
        self.y_data.append(y_data)
        self.marker_name.append(marker_name)

    def to_dict(self) -> dict:
        """Convert the chart to the dictionary stored in the run document.

        Enums become their values and styles become dictionaries, so the
        result is JSON as is. Fields left unset are omitted; a None inside a
        list (a gap, an unnamed or unstyled series) is kept.

        Returns:
            dict: Chart dictionary.
        """
        dumped = self.model_dump(mode="json")
        return {key: value for key, value in dumped.items() if value is not None}

    def _diff_list_len_validator(self, data1: list, data2: list) -> None:
        if len(data1) != len(data2):
            msg = "data in single series must have the same length"
            raise ValueError(msg)

    def _empty_list_validator(self, data: list) -> None:
        if len(data) == 0:
            msg = "data series cannot be empty"
            raise ValueError(msg)


def _validate_series_points(
    x_data: list[int | float | None],
    y_data: list[int | float | None],
) -> None:
    """A gap is a None in both coordinates, and a series needs a point to draw."""
    if any((x is None) != (y is None) for x, y in zip(x_data, y_data)):
        msg = "a gap in a series must be None in both x_data and y_data"
        raise ValueError(msg)
    if all(x is None for x in x_data):
        msg = "a data series must have at least one point that is not None"
        raise ValueError(msg)


def _validate_style_lengths(style: SeriesStyleModel, point_count: int) -> None:
    """Per-point style arrays must name every point of their series."""
    if style.hover_text is not None and len(style.hover_text) != point_count:
        msg = "hover_text must have one entry per point of the series"
        raise ValueError(msg)
    if style.color_values is not None and len(style.color_values) != point_count:
        msg = "color_values must have one entry per point of the series"
        raise ValueError(msg)
