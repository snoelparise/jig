"""Form dialog: several settings answered at once, prefilled with defaults."""

import pytest

from jig import (
    BooleanField,
    ChoiceField,
    DialogBox,
    FormWidget,
    NumberField,
    TextField,
    run_dialog_box,
    set_case_artifact,
)

pytestmark = pytest.mark.module_name("Form")


@pytest.mark.case_name("Form")
def test_form():
    """Dialog that collects a set of settings, keeping the defaults unless edited."""
    answer = run_dialog_box(
        DialogBox(
            title_bar="Burn settings",
            dialog_text="Check the settings, change what differs, then confirm.",
            widget=FormWidget(
                [
                    NumberField(
                        name="power_percent",
                        label="Laser power",
                        default=20.0,
                        unit="%",
                        minimum=0.1,
                        maximum=100.0,
                    ),
                    TextField(
                        name="calibration_id",
                        label="Power calibration",
                        default="7",
                    ),
                    ChoiceField(
                        name="speed",
                        label="Scan speed",
                        options=["slow", "normal", "fast"],
                        default="normal",
                    ),
                    BooleanField(
                        name="verify",
                        label="Verify after the burn",
                        default=True,
                    ),
                ],
            ),
        ),
    )
    set_case_artifact(answer)
    assert answer["power_percent"] > 0, "A power level is needed"
