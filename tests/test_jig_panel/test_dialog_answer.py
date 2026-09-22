# Copyright (c) 2026 Everypin
# GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

from jig.jig_panel.dialog_answer import decode_dialog_answer


def test_given_a_percent_encoded_text_answer_when_decoded_then_the_text_is_restored():
    assert decode_dialog_answer("caf%C3%A9%20%26%20th%C3%A9") == "café & thé"


def test_given_a_plain_text_answer_when_decoded_then_it_is_unchanged():
    assert decode_dialog_answer("ok") == "ok"
    assert decode_dialog_answer("12.5") == "12.5"


def test_given_a_form_answer_object_when_decoded_then_it_is_passed_through_untouched():
    answer = {"power": "20", "calibration": 'id "7" 100%', "verify": True}

    assert decode_dialog_answer(answer) == {
        "power": "20",
        "calibration": 'id "7" 100%',
        "verify": True,
    }
