# Copyright (c) 2026 Everypin
# GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
"""The operator's answer to a dialog box, as the pytest process receives it."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import unquote

_HEX_BASE = 16
_HEX_PATTERN = r"%([0-9a-fA-F]{2})"


def decode_dialog_answer(widget_data: Any) -> Any:  # noqa: ANN401
    """Undo the encoding the panel applied to a widget's answer.

    The single-value widgets percent-encode their text, which is undone here.
    A form answers with a JSON object whose values are carried by JSON escaping
    alone, so it is passed through untouched: decoding it would corrupt any
    quote an operator typed.

    Args:
        widget_data (Any): the `data` of the request body, a string or an object.

    Returns:
        Any: the decoded string, or the object as it came.
    """
    if isinstance(widget_data, dict):
        return widget_data
    unquoted = unquote(unquote(str(widget_data)))
    return re.sub(
        _HEX_PATTERN,
        lambda match: chr(int(match.group(1), _HEX_BASE)),
        unquoted,
    )
