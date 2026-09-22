import pytest

from jig import (
    BooleanField,
    ChoiceField,
    DialogBox,
    FormWidget,
    NumberField,
    TextField,
    run_dialog_box,
    set_message,
)

pytestmark = pytest.mark.module_name("Form dialog box")


@pytest.mark.case_name("Form with prefilled defaults")
def test_form():
    dbx = DialogBox(
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
                    hint="Share of the full power",
                ),
                TextField(
                    name="calibration_id",
                    label="Power calibration",
                    default="7",
                    hint="The calibration to fire through",
                ),
                ChoiceField(
                    name="speed",
                    label="Scan speed",
                    options=["slow", "normal", "fast"],
                    default="normal",
                ),
                TextField(
                    name="note",
                    label="Note",
                    required=False,
                    placeholder="Anything worth recording",
                ),
                BooleanField(
                    name="verify",
                    label="Verify after the burn",
                    default=True,
                ),
            ],
        ),
    )
    answer = run_dialog_box(dbx)
    set_message(
        f"Power {answer['power_percent']:g}% through calibration "
        f"{answer['calibration_id']}, {answer['speed']} scan, "
        f"verify={answer['verify']}, note={answer['note']!r}",
    )
    assert answer["power_percent"] > 0, "A power level is needed"


@pytest.mark.case_name("Form with pass/fail buttons")
def test_form_with_pass_fail():
    dbx = DialogBox(
        title_bar="Visual check",
        dialog_text="Count the marks on the sample, then judge the burn.",
        widget=FormWidget(
            [NumberField(name="marks", label="Marks counted", minimum=0)],
        ),
        pass_fail=True,
    )
    response = run_dialog_box(dbx)
    set_message(f"Pass/Fail: {response.result}, marks: {response.data['marks']:g}")
    assert response.result, "The burn was judged bad"
