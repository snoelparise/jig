# Copyright (c) 2026 Everypin
# GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
"""Fields of a form dialog box.

A form gathers several values in one dialog, each field prefilled with its
default, so the operator confirms a set of settings instead of answering one
question per value. Every field type validates its own answer: the panel
enforces the same rules while typing, and this side is the contract a test
can rely on.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import TYPE_CHECKING, Any, ClassVar

if TYPE_CHECKING:
    from collections.abc import Sequence


class FormFieldType(str, Enum):
    """Kind of form field, as the panel reads it."""

    NUMBER = "number"
    TEXT = "text"
    CHOICE = "choice"
    BOOLEAN = "boolean"


class FormAnswerError(ValueError):
    """The panel answered a form field with a value the field does not accept."""


@dataclass(frozen=True)
class _FormField:
    """What every field shares: its key in the answer and its label."""

    name: str
    label: str

    type: ClassVar[FormFieldType]

    def __post_init__(self) -> None:
        if not self.name or self.name != self.name.strip():
            msg = "A form field name must not be empty or padded with whitespace"
            raise ValueError(msg)
        if not self.label.strip():
            msg = f"The form field {self.name!r} must have a label"
            raise ValueError(msg)

    def to_dict(self) -> dict[str, Any]:
        """Convert the field to the dictionary the panel renders."""
        return {"type": self.type.value, **asdict(self)}

    def _required_error(self) -> FormAnswerError:
        return FormAnswerError(f"{self.label} is required")


@dataclass(frozen=True)
class NumberField(_FormField):
    """A number, typed into a numeric input prefilled with the default.

    Args:
        name (str): key of the value in the answer.
        label (str): text shown next to the input.
        default (float | None): value the input is prefilled with.
        unit (str | None): unit shown after the input.
        minimum (float | None): smallest accepted value.
        maximum (float | None): largest accepted value.
        required (bool): whether an empty input is refused.
        hint (str | None): help text shown under the input.
    """

    default: float | None = None
    unit: str | None = None
    minimum: float | None = None
    maximum: float | None = None
    required: bool = True
    hint: str | None = None

    type: ClassVar[FormFieldType] = FormFieldType.NUMBER

    def __post_init__(self) -> None:
        super().__post_init__()
        if (
            self.minimum is not None
            and self.maximum is not None
            and self.minimum > self.maximum
        ):
            msg = f"{self.label}: minimum must not exceed maximum"
            raise ValueError(msg)
        if self.default is not None:
            violation = self._range_violation(float(self.default))
            if violation:
                msg = f"{self.label}: the default is out of range, {violation}"
                raise ValueError(msg)

    def convert(self, raw: Any) -> float | None:  # noqa: ANN401
        """Convert the panel's answer to a float, None when left empty.

        Raises:
            FormAnswerError: If a required field is empty, the answer is not
                a number, or it lies outside the accepted range.
        """
        if _is_blank(raw):
            if self.required:
                raise self._required_error()
            return None
        try:
            value = float(raw)
        except (TypeError, ValueError) as error:
            msg = f"{self.label} must be a number, got {raw!r}"
            raise FormAnswerError(msg) from error
        violation = self._range_violation(value)
        if violation:
            msg = f"{self.label} {violation}"
            raise FormAnswerError(msg)
        return value

    def _range_violation(self, value: float) -> str | None:
        if self.minimum is not None and value < self.minimum:
            return f"must be at least {self.minimum:g}, got {value:g}"
        if self.maximum is not None and value > self.maximum:
            return f"must be at most {self.maximum:g}, got {value:g}"
        return None


@dataclass(frozen=True)
class TextField(_FormField):
    """A line of text, prefilled with the default.

    Args:
        name (str): key of the value in the answer.
        label (str): text shown next to the input.
        default (str): text the input is prefilled with.
        placeholder (str | None): text shown while the input is empty.
        required (bool): whether an empty input is refused.
        hint (str | None): help text shown under the input.
    """

    default: str = ""
    placeholder: str | None = None
    required: bool = True
    hint: str | None = None

    type: ClassVar[FormFieldType] = FormFieldType.TEXT

    def convert(self, raw: Any) -> str:  # noqa: ANN401
        """Convert the panel's answer to a stripped string.

        Raises:
            FormAnswerError: If a required field is empty.
        """
        if _is_blank(raw):
            if self.required:
                raise self._required_error()
            return ""
        return str(raw).strip()


@dataclass(frozen=True)
class ChoiceField(_FormField):
    """One option out of a list, shown as a drop-down.

    Args:
        name (str): key of the value in the answer.
        label (str): text shown next to the input.
        options (Sequence[str]): the values to choose from.
        default (str | None): option selected when the form opens.
        required (bool): whether leaving the choice empty is refused.
        hint (str | None): help text shown under the input.
    """

    options: Sequence[str] = field(default=())
    default: str | None = None
    required: bool = True
    hint: str | None = None

    type: ClassVar[FormFieldType] = FormFieldType.CHOICE

    def __post_init__(self) -> None:
        super().__post_init__()
        if not self.options:
            msg = f"{self.label} must offer at least one option"
            raise ValueError(msg)
        if len(set(self.options)) != len(self.options):
            msg = f"{self.label} options must be unique"
            raise ValueError(msg)
        if self.default is not None and self.default not in self.options:
            msg = f"{self.label}: the default {self.default!r} is not an option"
            raise ValueError(msg)
        # Stored as a list so the field serialises to JSON as the panel expects.
        object.__setattr__(self, "options", list(self.options))

    def convert(self, raw: Any) -> str | None:  # noqa: ANN401
        """Convert the panel's answer to the chosen option, None when empty.

        Raises:
            FormAnswerError: If a required field is empty or the answer is
                not one of the options.
        """
        if _is_blank(raw):
            if self.required:
                raise self._required_error()
            return None
        if raw not in self.options:
            msg = f"{self.label}: {raw!r} is not one of {list(self.options)}"
            raise FormAnswerError(msg)
        return str(raw)


@dataclass(frozen=True)
class BooleanField(_FormField):
    """A yes/no switch, shown as a checkbox.

    Args:
        name (str): key of the value in the answer.
        label (str): text shown next to the checkbox.
        default (bool): whether the checkbox starts ticked.
        hint (str | None): help text shown under the checkbox.
    """

    default: bool = False
    hint: str | None = None

    type: ClassVar[FormFieldType] = FormFieldType.BOOLEAN

    def convert(self, raw: Any) -> bool:  # noqa: ANN401
        """Convert the panel's answer to a bool.

        Raises:
            FormAnswerError: If the answer is neither a bool nor "true"/"false".
        """
        if isinstance(raw, bool):
            return raw
        if isinstance(raw, str) and raw.strip().lower() in {"true", "false"}:
            return raw.strip().lower() == "true"
        msg = f"{self.label} must be true or false, got {raw!r}"
        raise FormAnswerError(msg)


FormField = NumberField | TextField | ChoiceField | BooleanField


def _is_blank(raw: Any) -> bool:  # noqa: ANN401
    return raw is None or (isinstance(raw, str) and not raw.strip())
