import pytest

from jig import (
    BooleanField,
    ChoiceField,
    DialogBox,
    FormAnswerError,
    FormWidget,
    NumberField,
    TextField,
)


def test_given_fields_when_the_form_is_built_then_each_field_reaches_the_panel():
    widget = FormWidget(
        [
            NumberField(
                name="power",
                label="Laser power",
                default=20.0,
                unit="%",
                minimum=0.1,
                maximum=100.0,
                hint="Leave 20 unless told otherwise",
            ),
            TextField(name="calibration", label="Calibration id", default="7"),
            ChoiceField(
                name="speed",
                label="Speed",
                options=["slow", "fast"],
                default="fast",
            ),
            BooleanField(name="verify", label="Verify after burn", default=True),
        ],
    )

    assert widget.type == "form"
    assert widget.info == {
        "fields": [
            {
                "type": "number",
                "name": "power",
                "label": "Laser power",
                "default": 20.0,
                "unit": "%",
                "minimum": 0.1,
                "maximum": 100.0,
                "required": True,
                "hint": "Leave 20 unless told otherwise",
            },
            {
                "type": "text",
                "name": "calibration",
                "label": "Calibration id",
                "default": "7",
                "placeholder": None,
                "required": True,
                "hint": None,
            },
            {
                "type": "choice",
                "name": "speed",
                "label": "Speed",
                "options": ["slow", "fast"],
                "default": "fast",
                "required": True,
                "hint": None,
            },
            {
                "type": "boolean",
                "name": "verify",
                "label": "Verify after burn",
                "default": True,
                "hint": None,
            },
        ],
    }


def test_given_a_form_in_a_dialog_when_serialised_then_only_type_and_info_are_kept():
    dialog = DialogBox(
        dialog_text="Set the burn",
        widget=FormWidget([NumberField(name="power", label="Power", default=1.0)]),
    )

    assert dialog.to_dict()["widget"] == {
        "type": "form",
        "info": {
            "fields": [
                {
                    "type": "number",
                    "name": "power",
                    "label": "Power",
                    "default": 1.0,
                    "unit": None,
                    "minimum": None,
                    "maximum": None,
                    "required": True,
                    "hint": None,
                },
            ],
        },
    }


def test_given_an_answer_object_when_converted_then_each_field_converts_its_own_value():
    widget = FormWidget(
        [
            NumberField(name="power", label="Power"),
            TextField(name="calibration", label="Calibration id"),
            ChoiceField(name="speed", label="Speed", options=["slow", "fast"]),
            BooleanField(name="verify", label="Verify"),
        ],
    )

    answer = widget.convert_data(
        {"power": "25", "calibration": " 12 ", "speed": "slow", "verify": False},
    )

    assert answer == {
        "power": 25.0,
        "calibration": "12",
        "speed": "slow",
        "verify": False,
    }


def test_given_the_answer_as_json_text_when_converted_then_it_is_read_the_same_way():
    widget = FormWidget(
        [NumberField(name="power", label="Power"), BooleanField(name="on", label="On")],
    )

    assert widget.convert_data('{"power": "2.5", "on": "true"}') == {
        "power": 2.5,
        "on": True,
    }


def test_given_optional_fields_left_empty_when_converted_then_they_are_none_or_empty():
    widget = FormWidget(
        [
            NumberField(name="power", label="Power", required=False),
            TextField(name="note", label="Note", required=False),
            ChoiceField(
                name="speed",
                label="Speed",
                options=["slow"],
                required=False,
            ),
        ],
    )

    assert widget.convert_data({"power": "", "note": "", "speed": ""}) == {
        "power": None,
        "note": "",
        "speed": None,
    }


def test_given_no_answer_at_all_when_converted_then_optional_fields_are_empty():
    widget = FormWidget([TextField(name="note", label="Note", required=False)])

    assert widget.convert_data(None) == {"note": ""}
    assert widget.convert_data("") == {"note": ""}


def test_given_a_required_number_left_empty_when_converted_then_it_is_refused():
    widget = FormWidget([NumberField(name="power", label="Laser power")])

    with pytest.raises(FormAnswerError, match="Laser power is required"):
        widget.convert_data({"power": ""})


def test_given_a_number_out_of_range_when_converted_then_it_is_refused():
    widget = FormWidget(
        [NumberField(name="power", label="Laser power", minimum=1.0, maximum=100.0)],
    )

    with pytest.raises(FormAnswerError, match="Laser power must be at most 100"):
        widget.convert_data({"power": "150"})
    with pytest.raises(FormAnswerError, match="Laser power must be at least 1"):
        widget.convert_data({"power": "0.5"})


def test_given_text_in_a_number_field_when_converted_then_it_is_refused():
    widget = FormWidget([NumberField(name="power", label="Laser power")])

    with pytest.raises(FormAnswerError, match="Laser power must be a number"):
        widget.convert_data({"power": "twenty"})


def test_given_an_option_that_was_not_offered_when_converted_then_it_is_refused():
    widget = FormWidget(
        [ChoiceField(name="speed", label="Speed", options=["slow", "fast"])],
    )

    with pytest.raises(FormAnswerError, match="'warp' is not one of"):
        widget.convert_data({"speed": "warp"})


def test_given_a_non_boolean_for_a_switch_when_converted_then_it_is_refused():
    widget = FormWidget([BooleanField(name="verify", label="Verify")])

    with pytest.raises(FormAnswerError, match="Verify must be true or false"):
        widget.convert_data({"verify": "maybe"})


def test_given_an_answer_that_is_not_a_json_object_when_converted_then_it_is_refused():
    widget = FormWidget([TextField(name="note", label="Note")])

    with pytest.raises(FormAnswerError, match="must be a JSON object"):
        widget.convert_data("not json")
    with pytest.raises(FormAnswerError, match="must be a JSON object"):
        widget.convert_data("[1, 2]")


def test_given_no_fields_when_the_form_is_built_then_it_is_refused():
    with pytest.raises(ValueError, match="at least one field"):
        FormWidget([])


def test_given_two_fields_with_one_name_when_the_form_is_built_then_it_is_refused():
    with pytest.raises(ValueError, match="unique"):
        FormWidget(
            [
                NumberField(name="power", label="Power"),
                TextField(name="power", label="Power again"),
            ],
        )


def test_given_a_default_outside_the_range_when_the_field_is_built_then_it_is_refused():
    with pytest.raises(ValueError, match="default is out of range"):
        NumberField(name="power", label="Power", default=150.0, maximum=100.0)


def test_given_a_minimum_above_the_maximum_when_the_field_is_built_then_it_is_refused():
    with pytest.raises(ValueError, match="minimum must not exceed maximum"):
        NumberField(name="power", label="Power", minimum=10.0, maximum=1.0)


def test_given_a_blank_name_or_label_when_the_field_is_built_then_it_is_refused():
    with pytest.raises(ValueError, match="name must not be empty"):
        TextField(name=" power", label="Power")
    with pytest.raises(ValueError, match="must have a label"):
        TextField(name="power", label="  ")


def test_given_a_choice_with_bad_options_or_default_when_built_then_it_is_refused():
    with pytest.raises(ValueError, match="at least one option"):
        ChoiceField(name="speed", label="Speed", options=[])
    with pytest.raises(ValueError, match="options must be unique"):
        ChoiceField(name="speed", label="Speed", options=["slow", "slow"])
    with pytest.raises(ValueError, match="'warp' is not an option"):
        ChoiceField(name="speed", label="Speed", options=["slow"], default="warp")
