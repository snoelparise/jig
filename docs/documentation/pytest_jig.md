# pytest-jig

**pytest-jig** is a pytest plugin that helps you save test data in a
database for test reporting and viewing test data in the web interface.

## Plugin registration

To use the **pytest-jig** you need to enable it.
You can do this via the `pytest.ini` file.

**Example:**

```ini
# pytest.ini
[pytest]
addopts = --jig-pt
```

Another way to enable a plugin without `pytest.ini` file is to run tests with the option `--jig-pt`.

```bash
pytest --jig-pt tests
```

If tests are run via [jig panel](jig_panel.md), then the pytest-jig plugin will be enabled for tests by default.

## Functions

#### set_user_name

Writes a string with a **Jig** operator panel user name.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `name` *(str)*: User name

**Example:**

```python
def test_user_name():
    set_user_name("test_operator")
    with pytest.raises(DuplicateParameterError):
        set_user_name("another_operator")
```

#### set_batch_serial_number

Writes a string with the serial number of the device batch.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `serial_number` *(str)*: Batch serial number

**Example:**

```python
def test_batch_number():
    set_batch_serial_number("BATCH-001")
```

#### set_dut_info

This function records a dictionary containing information about the test stand.
When called again, the information will be added to DB.

**Arguments:**

- `info` *(Mapping[str, str | int | float  | None])*: DUT info

**Example:**

```python
def test_dut_info():
    set_dut_info({"sw_version": "1.0.0"})
```

#### set_dut_serial_number

Writes a string with a serial number.
When called again, the exception `DuplicateParameterError` will be caused.

**Arguments:**

- `serial_number` *(str)*: DUT serial number

**Example:**

```python
def test_serial_number():
    set_dut_serial_number("1234")
```

#### set_dut_part_number

Writes a string with a part number.
When called again, the exception `DuplicateParameterError` will be caused.

**Arguments:**

- `part_number` *(str)*: DUT part number

**Example:**

```python
def test_part_number():
    set_dut_part_number("part_1")
```

#### set_dut_name

Writes a string with a human-readable name of the DUT.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `name` *(str)*: DUT name

**Example:**

```python
def test_dut_name():
    set_dut_name("Test Device")
```

#### set_dut_type

Writes a string with a type of DUT, f.e "PCBA", "Casing", etc.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `dut_type` *(str)*: DUT type

**Example:**

```python
def test_dut_type():
    set_dut_type("PCBA")
```

#### set_dut_revision

Writes a string with a DUT revision.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `revision` *(str)*: DUT revision (e.g. "REV1.0")

**Example:**

```python
def test_dut_revision():
    set_dut_revision("HW1.0")
```

#### set_dut_sub_unit

Writes a sub unit of DUT.
It accepts a [SubUnit](#subunit) object containing all the details of the sub unit.

**Arguments:**

- `sub_unit` *(SubUnit)*: SubUnit object

**Returns:**

- *(int)*: sub unit index

**Example:**

```python
def test_dut_sub_unit():
    sub_unit = SubUnit(
        serial_number="12345",
        part_number="part_number_1",
        name="Test Device",
        type="PCBA",
        revision="REV1.0",
        info={"sw_version": "1.0"},
    )
    jig.set_dut_sub_unit(sub_unit)
```

#### set_dut_revision

Writes a string with a DUT revision.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `revision` *(str)*: DUT revision (e.g. "REV1.0")

**Example:**

```python
def test_dut_revision():
    set_dut_revision("HW1.0")
```

#### set_stand_name

Writes a string with a test stand name.
When called again, the exception `DuplicateParameterError` will be caused.

**Arguments:**

- `name` *(str)*: test stand name

**Example:**

```python
def test_stand_name():
    set_stand_name("name 1")
```

#### set_stand_info

Writes a dictionary with information about the test stand.
When called again, the information will be merged with existing data.

**Arguments:**

- `info` *(Mapping[str, str | int | float ])*: Test stand info dictionary

**Example:**

```python
def test_stand_info():
    set_stand_info({"calibration_date": "2023-01-15"})
```

#### set_stand_location

Writes a string with a test stand location.
When called again, the exception `DuplicateParameterError` will be caused.

**Example:**

```python
def test_stand_info():
    set_stand_location("Moon")
```

#### set_stand_number

Writes a integer number with a test stand number.
When called again, the exception `DuplicateParameterError` will be caused.
When called with negative or non-integer number, the exception `TestStandNumberError` will be caused.

**Arguments:**

- `number` *(int)*: test stand number

**Example:**

```python
def test_stand_number():
    set_stand_number(3)
```

#### set_stand_revision

Writes a string with a test stand revision.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `revision` *(str)*: Test stand revision

**Example:**

```python
def test_stand_revision():
    set_stand_revision("HW1.0")
```


#### set_driver_info

**DEPRECATED, DO NOT USE IT.**

The function records a dictionary containing information about the test stand driver.
The data is updated with new information each time the function is called.

Driver data is stored in both **statestore** and **runstore** databases.

**Arguments:**

- `drivers` *(dict)*: A dictionary of drivers, where keys are driver names and values are driver-specific data.

**Example:**

```python
def test_driver_info():
    drivers = {
        "driver_1": {
            "name": "Driver A",
            "type": "network"
        }
    }
    set_driver_info(drivers)
```

#### set_instrument

Adds a new information about the instrument (i.e equipment) that form part of the test bench.

Can be called multiple times to add multiple instruments.
Accepts an [Instrument](#instrument) object containing all instrument details.

**Instrument Parameters:**

- `name` *(str | None)*: Instrument name
- `revision` *(str | None)*: Instrument revision
- `serial_number` *(str | None)* Instrument serial number
- `part_number` *(str | None)*  Instrument part number
- `number` *(int | None)*: Instrument number  
- `comment` *(str | None)*: Instrument comment  
- `info` *(Mapping[str, str | int | float ] | None)*: Additional instrument info 

**Example:**

```python
def test_instruments():
    instrument = Instrument(
        name="Oscilloscope",
        revision="1.2",
        serial_number="4235098",
        part_number="E012",
        number=1,
        info={"model": "DSO-X 2024A", "bandwidth": "200MHz"}
    )
    set_instrument(instrument)
```

#### set_process_name

Writes a string with a process name.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `name` *(str)*: Process name (e.g. "Production Test")

**Example:**

```python
def test_process():
    set_process_name("Acceptance Test")
```

#### set_process_number

Writes an integer with a process number.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `number` *(int)*: Process number

**Example:**

```python
def test_process():
    set_process_number(1)
```

#### set_process_info

Writes a dictionary with additional information about the process.
When called again, the information will be merged with existing data.

**Arguments:**

- `info` *(Mapping[str, str | int | float | None])*: Process info dictionary

**Example:**

```python
def test_process_info():
    set_process_info({
        "stage": "production",
        "version": "1.0",
    })
```

#### set_case_measurement

Writes measurement information to a database in the form of a case measurement list.
When called again, the information will be added to case measurement list.

**Arguments:**

- `measurement` [NumericMeasurement](#numericmeasurement) |
  [StringMeasurement](#stringmeasurement): measurement data.

**Returns:**

- *(int)*: measurement index

**Example:**

```python
def test_measurement():
    meas_1 = NumericMeasurement(
        name="Voltage", 
        value=12.3, 
        unit="V",
        operation=ComparisonOperation.GELE, 
        lower_limit=10.0, 
        upper_limit=15.0
    )
    set_case_measurement(meas_1)
    
    meas_2 = NumericMeasurement(
        value=5, 
        unit="°", 
        operation=ComparisonOperation.EQ, 
        comparison_value=5
    )
    set_case_measurement(meas_2)
    
    meas_3 = NumericMeasurement(
        name="Count",
        value=42
    )
    set_case_measurement(meas_3)

    meas_4 = StringMeasurement(
        value="1.2.0", 
        operation=ComparisonOperation.EQ, 
        comparison_value="1.2.0"
    )
    set_case_measurement(meas_4)

    meas_5 = StringMeasurement(
        name="Version",
        value="v2.1.0", 
        operation=ComparisonOperation.EQ, 
        comparison_value="v2.1.0"
    )
    set_case_measurement(meas_5)

    assert meas_1.result
    assert meas_2.result
    assert meas_4.result
    assert meas_5.result
```

**Operator panel display:**
The example above would display in the operator panel as:

- `Voltage 12.3 V`
- `5°`
- `Count 42`
- `1.2.0`
- `Version v2.1.0`

#### set_case_chart

Writes chart (data series) information to a test case in the database.
Only one [Chart](#chart) object can be stored per test case in the database.
When called again, the exception `DuplicateParameterError` will be raised.

**Arguments:**

- `chart` [Chart](#chart): chart data.

**Example:**

```python
def test_chart():
    chart = jig.Chart(
        type=jig.ChartType.LINE,
        title="title",
        x_label="x_label",
        y_label="y_label",
        marker_name=["marker_name", None],
        x_data=[ [1, 2], [1, 2] ],
        y_data=[ [3, 4], [3, 4] ]
    )
    jig.set_case_chart(chart)
```

#### set_case_artifact

Writes a dictionary with a test case artifact.
When called again, the data will be added to DB.

Artifacts are saved only in the **runstore** database
because the state in **statestore** and case artifact must be separated.

The `set_case_artifact` function must be called from a test case.

**Arguments:**

- `data` *(dict)*: data

**Example:**

```python
def test_case_artifact():
    set_case_artifact({"data_str": "123DATA"})
```

#### set_module_artifact

Writes a dictionary with a module test artifact.
When called again, the data will be added to DB.

Artifacts are saved only in the **runstore** database
because the state in **statestore** and module artifact must be separated.

The `set_module_artifact` function must be called from a test case.

**Arguments:**

- `data` *(dict)*: data

**Example:**

```python
def test_module_artifact():
    set_module_artifact({"data_str": "456DATA"})
```

#### set_run_artifact

Writes a dictionary with a test run artifact.
When called again, the data will be added to DB.

Artifacts are saved only in the **runstore** database
because the state in **statestore** and run artifact must be separated.

**Arguments:**

- `data` *(dict)*: data

**Example:**

```python
def test_run_artifact():
    set_run_artifact({"data_str": "789DATA"})
```

#### set_message

Writes a string with a message.
If a message is sent without a key, the key will be generated
automatically and the messages will be appended.
If the message is sent with a known key, it will be updated.

The `set_message` function must be called from a test case.

**Arguments:**

- `msg` *(str)*: Message content.
- `msg_key` *(Optional[str])*: Message ID. If not specified, a random ID will be generated.

**Example:**

```python
def test_message():
    set_message("Test message")
    set_message("Update message 1", "msg_upd")
    set_message("Update message 2", "msg_upd")
```

#### set_operator_message

Sets an operator message in the **statestore** database and updates the database.
Does not provide user interaction unlike the [run_dialog_box](#run_dialog_box) function.

**Arguments:**

- `msg` *(str)*: The message to be displayed.
- `title` *(str | None)*: The optional title for the message.
- `block` *(bool=True)*: If True, the function will block until the message is closed,
  and the operator panel shows the message in a dialog box.
  If False, the operator panel shows the message as a notification,
  which leaves the panel usable.
- `image` *([ImageComponent](#imagecomponent) | None)*: Image information.
- `html` *([HTMLComponent](#htmlcomponent) | None)*: HTML information.
- `font_size`: *(int=14)*: Text font size.

**Example:**

```python
from jig import set_operator_message

def test_set_operator_msg():
    set_operator_message(msg="This is a sample operator message.", title="Important Notice")
```

#### clear_operator_message

Clears the current message to the operator if it exists, otherwise does nothing.

**Example:**

```python
from time import sleep
from jig import set_operator_message, clear_operator_message

def test_clear_operator_msg():
    jig.set_operator_message(msg="Clearing operator message.", title="Operator message", block=False)
    sleep(2)
    clear_operator_message()
```

#### run_dialog_box

Displays a dialog box and updates the `dialog_box` field in the **statestore** database.

The `run_dialog_box` function must be called from a test case.

**Arguments:**

- `dialog_box_data` ([DialogBox](#dialogbox)): Data for the dialog box.

**Returns:**

- *(Any)*: An object containing the user's response.

The type of the return value depends on the widget type:

- Without widget (BASE): bool.
- NUMERIC_INPUT: float.
- TEXT_INPUT: str.
- RADIOBUTTON: str.
- CHECKBOX: List(str).
- MULTISTEP: bool.
- FORM: dict, one converted value per field name (see [FormWidget](#formwidget)).

**Raises**

- `ValueError`: If the `message` argument is empty.

**Example:**

```python
from jig import dialog_box
def test_text_input():
    dbx = DialogBox(
        dialog_text="Type 'ok' and press the Confirm button",
        title_bar="Example of text input",
        widget=TextInputWidget(),
        image=ImageComponent(address="assets/test.png", width=50),
    )
    response = run_dialog_box(dbx)
    set_message(f"Entered text {response}")
    assert response == "ok", "The entered text is not correct"
```

#### get_current_report

Returns the current report from the database **runstore**.

**Returns:**

- *(ResultRunStore | None)*: report, or None if not found or invalid

**Example:**

```python
def test_current_report():
    report = get_current_report()
```

#### get_current_attempt

Returns the num of current attempt.

The `get_current_attempt` function must be called from a test case.

**Returns:**

- *(int)*: num of current attempt

**Example:**

```python
@pytest.mark.attempt(5)
def test_attempt_message():
    attempt = jig.get_current_attempt()
    jig.set_message(f"Current attempt {attempt}")
    if attempt < 5:
        assert False
```

#### get_jig_config

Returns the actual Jig project configuration from the [jig.toml](./jig_config.md) file.

**Returns:**

- *[JigConfig](#jigconfig)*: Jig project configuration.
  
**Example:**

```python
config = jig.get_jig_config()
print(config.database.storage_type)
```

## Class

#### JigConfig

This class defines the configuration of the Jig project for the [jig.toml](./jig_config.md) file.
Users can obtain an instance of **JigConfig** with the current values from the 
jig.toml file using the [get_jig_config()](#get_jig_config) function.

#### DialogBox

The class is used to configure the dialogue box and is used with
the [run_dialog_box](#run_dialog_box) function.

**Arguments:**

- `dialog_text` *(str)*: The text of the dialog box.
- `title_bar` *(str | None)*: The title bar of the dialog box.
If the `title_bar` field is missing, it is the case name.
- `widget` *(IWidget | None)*: Widget information.
- `image` *([ImageComponent](#imagecomponent) | None)*: Image information.
- `html` *([HTMLComponent](#htmlcomponent) | None)*: HTML information.
- `font_size`: *(int=14)*: Text font size.
- `pass_fail`: *(bool)*: enable pass/fail buttons instead of confirm button.
- `button_text`: *(list | None)*: user text for buttons.

Widget list:

- Base, only dialog text;
- Text input, [TextInputWidget](#textinputwidget);
- Numeric input, [NumericInputWidget](#numericinputwidget);
- Radiobutton, [RadiobuttonWidget](#radiobuttonwidget);
- Checkbox, [CheckboxWidget](#checkboxwidget);
- Multistep, [MultistepWidget](#multistepwidget);
- Form, [FormWidget](#formwidget).

**Example:**

```python
    DialogBox(title_bar="Example title", dialog_text="Example text")
```

#### TextInputWidget

The class is used to configure text input widget in [dialog box](#dialogbox).
Further information can be found in section
[text input field](./jig_panel.md/#text-input-field).
Widget returns a string when using [run_dialog_box](#run_dialog_box).

**Example:**

```python
    dbx = DialogBox(
        dialog_text="Type 'ok' and press the Confirm button",
        title_bar="Example of text input",
        widget=TextInputWidget(),
    )
    response = run_dialog_box(dbx)
```

#### NumericInputWidget

The class is used to configure numeric input widget in [dialog box](#dialogbox).
Further information can be found in section
[numeric input field](./jig_panel.md/#number-input-field).
Widget returns a float when using [run_dialog_box](#run_dialog_box).

**Example:**

```python
    dbx = DialogBox(
        dialog_text=f"Enter the number {test_num} and press the Confirm button",
        title_bar="Example of entering a number",
        widget=NumericInputWidget(),
    )
    response = int(run_dialog_box(dbx))
```

#### RadiobuttonWidget

The class is used to configure radiobutton widget in [dialog box](#dialogbox).
Further information can be found in section
[radiobutton](./jig_panel.md/#radiobutton).
Widget returns a string with the selected radiobutton value
[run_dialog_box](#run_dialog_box).

**Arguments:**

- `fields` *(list[str])*: Radiobutton fields.

**Example:**

```python
    dbx = DialogBox(
        dialog_text='Select item "one" out of several and click Confirm.',
        title_bar="Radiobutton example",
        widget=RadiobuttonWidget(fields=["one", "two", "three"]),
    )
    response = run_dialog_box(dbx)
```

#### CheckboxWidget

The class is used to configure checkbox widget in [dialog box](#dialogbox).
Further information can be found in section
[checkbox](./jig_panel.md/#checkbox).
Widget returns a list of string with the selected checkbox value
[run_dialog_box](#run_dialog_box).

**Arguments:**

- `fields` *(list[str])*: Checkbox fields.

**Example:**

```python
    dbx = DialogBox(
        dialog_text='Select items "one" and "two" and click the Confirm button',
        title_bar="Checkbox example",
        widget=CheckboxWidget(fields=["one", "two", "three"]),
    )
    response = run_dialog_box(dbx)
```

#### StepWidget

The class is used to configure the step for the
[multistep](#multistepwidget) widget in [dialog box](#dialogbox).

**Arguments:**

- `title` *(str)*: Step title.
- `text` *(str | None)*: Step text.
- `image` *([ImageComponent](#imagecomponent) | None)*: Step image.
- `html` *([HTMLComponent](#htmlcomponent) | None)*: Step HTML.

**Example:**

```python
    StepWidget("Step 1", text="Content for step")
```

#### MultistepWidget

The class is used to configure multistep widget in [dialog box](#dialogbox).
Further information can be found in section
[multiple steps](./jig_panel.md/#multiple-steps).

**Arguments:**

- `steps` *(list[[StepWidget](#stepwidget)])*: A list with info about the steps.

**Example:**

```python
    steps = [
        StepWidget("Step 1", text="Content for step"),
        StepWidget("Step 2", text="Content for step 2", image=ImageComponent(address="assets/test.png", width=100)),
        StepWidget("Step 3", text="Content for step 3", html=HTMLComponent(html="https://everypinio.github.io/jig/", width=50)),
    ]
    dbx = DialogBox(dialog_text="Follow the steps and click Confirm", widget=MultistepWidget(steps))
    response = run_dialog_box(dbx)
```

#### FormWidget

The class is used to configure a form in a [dialog box](#dialogbox): several
fields answered at once, each prefilled with its default. Further information
can be found in section [form](./jig_panel.md/#form).

Use it where a test would otherwise chain one dialog per value. The operator
sees every setting on one screen, keeps the defaults by confirming as is, and
is told under the field concerned when a value is refused.

The widget returns a `dict` when using [run_dialog_box](#run_dialog_box):
one entry per field, keyed by field name, each converted by the field that
declared it. With `pass_fail=True`, that dictionary is the `data` of the
returned `PassFailDialog`.

**Arguments:**

- `fields` *(Sequence[[NumberField](#numberfield) | [TextField](#textfield) | [ChoiceField](#choicefield) | [BooleanField](#booleanfield)])*: the fields, in the order they are shown.

**Raises:**

- `ValueError`: if there is no field, or two fields share a name.
- `FormAnswerError` (a `ValueError`): from `run_dialog_box`, if the panel
  answers a field with a value the field does not accept. The panel enforces
  the same rules while typing, so this marks a panel out of step with the
  test rather than an operator mistake.

**Example:**

```python
    dbx = DialogBox(
        title_bar="Galvo burn",
        dialog_text="Set the burn, then confirm.",
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
                TextField(name="calibration_id", label="Power calibration", default="7"),
                ChoiceField(name="speed", label="Speed", options=["slow", "fast"], default="fast"),
                BooleanField(name="verify", label="Verify after the burn", default=True),
            ]
        ),
    )
    answer = run_dialog_box(dbx)
    power_percent: float = answer["power_percent"]
    calibration_id: str = answer["calibration_id"]
```

#### NumberField

A number, typed into a numeric input of a [form](#formwidget). Converted to
`float`, or `None` when an optional field is left empty.

**Arguments:**

- `name` *(str)*: key of the value in the answer.
- `label` *(str)*: text shown next to the input.
- `default` *(float | None)*: value the input is prefilled with.
- `unit` *(str | None)*: unit shown after the input.
- `minimum` *(float | None)*: smallest accepted value.
- `maximum` *(float | None)*: largest accepted value.
- `required` *(bool=True)*: whether an empty input is refused.
- `hint` *(str | None)*: help text shown under the input.

#### TextField

A line of text in a [form](#formwidget). Converted to a stripped `str`.

**Arguments:**

- `name` *(str)*: key of the value in the answer.
- `label` *(str)*: text shown next to the input.
- `default` *(str="")*: text the input is prefilled with.
- `placeholder` *(str | None)*: text shown while the input is empty.
- `required` *(bool=True)*: whether an empty input is refused.
- `hint` *(str | None)*: help text shown under the input.

#### ChoiceField

One option out of a list, shown as a drop-down in a [form](#formwidget).
Converted to the chosen option, or `None` when an optional choice is left
unmade.

**Arguments:**

- `name` *(str)*: key of the value in the answer.
- `label` *(str)*: text shown next to the input.
- `options` *(Sequence[str])*: the values to choose from.
- `default` *(str | None)*: option selected when the form opens.
- `required` *(bool=True)*: whether leaving the choice unmade is refused.
- `hint` *(str | None)*: help text shown under the input.

#### BooleanField

A yes/no switch, shown as a checkbox in a [form](#formwidget). Converted to
`bool`.

**Arguments:**

- `name` *(str)*: key of the value in the answer.
- `label` *(str)*: text shown next to the checkbox.
- `default` *(bool=False)*: whether the checkbox starts ticked.
- `hint` *(str | None)*: help text shown under the checkbox.

#### ImageComponent

A class for configuring an image for a dialogue box or operator message box and is used with
the [run_dialog_box](#run_dialog_box) and [set_operator_message](#set_operator_message) functions.

**Arguments:**

- `address` *(str)*: Image address.
- `width` *(int | None)*: Image width in %.
- `border` *(int | None)*: Image border width.

**Example:**

```python
    ImageComponent(address="assets/test.png", width=100)
```

#### HTMLComponent

A class for configurating HTML for a dialogue box or operator message box and is used with
the [run_dialog_box](#run_dialog_box) and [set_operator_message](#set_operator_message) functions.

**Arguments:**

- `code_or_url` *(str)*: HTML code or link.
- `width` *(int | None)*: HTML width in %.
- `border` *(int | None)*: HTML border width.
- `is_raw_html` *(bool)*: Is HTML code is raw.

**Example:**

```python
    HTMLComponent(code_or_url="https://everypinio.github.io/jig/", width=100, is_raw_html=False)
```

#### CouchdbLoader

Used to write reports to the database **CouchDB**.

Report names (revision id) are automatically generated based on the test
completion date and the device serial number.
If the serial number dut is empty, a random identifier with
prefix `no_serial` is used.
The random identifier is a unique string generated using the `uuid4()`
function from the `uuid` module in Python.
This allows for easy identification and sorting of reports.

* Valid report name: `report_1726496218_1234567890`
* Valid report name (no serial number): `report_1726496218_no_serial_808007`

**Functions:**

- `load` *(ResultRunStore)*: Load report to the CouchDB **report** database.

**Example:**

```python
# conftest
def finish_executing():
    report = get_current_report()
    if report:
        loader = CouchdbLoader(CouchdbConfig())
        loader.load(report)

@pytest.fixture(scope="session", autouse=True)
def fill_actions_after_test(post_run_functions: list):
    post_run_functions.append(finish_executing)
    yield
```

#### JsonLoader

Used to write reports to the JSON.

**Arguments:**

- `storage_dir` *(Path | None)*: JSON file directory.

**Functions:**

- `load` *(ResultRunStore, new_report_id)*: Load report to the JSON file.

**Example:**

```python
# conftest
def save_report_to_dir():
    report = get_current_report()
    if report:
        loader = JsonLoader(Path.cwd() / "reports")
        loader.load(report)


@pytest.fixture(scope="session", autouse=True)
def fill_actions_after_test(post_run_functions: list):
    post_run_functions.append(save_report_to_dir)
    yield
```

#### StandCloudLoader

Used to write reports to the **StandCloud**.
A login to **StandCloud** is required to work.

**Arguments:**

- `address` *(str | None)*: StandCloud address. Defaults to None
  (the value is taken from [jig.toml](./jig_config.md)). Can be used outside of **Jig** applications.

**Functions:**

- `healthcheck`: Healthcheck of StandCloud API.
  Returns the `requests.Response` object.
- `load` *(ResultRunStore)*: Load report to the StandCloud.
  Returns the `requests.Response` object.
  Status code 201 is considered a successful status.

**Example:**

```python
# conftest
def finish_executing():
    report = get_current_report()
    if report:
        try:
            loader = StandCloudLoader()
            response = loader.load(report)
            if response.status_code != HTTPStatus.CREATED:
                set_operator_message(
                    "Report not uploaded to StandCloud, "
                    f"status code: {response.status_code}, text: {response.text}",
                )
        except StandCloudError as exc:
            set_operator_message(f"{exc}")

@pytest.fixture(scope="session", autouse=True)
def fill_actions_after_test(post_run_functions: list):
    post_run_functions.append(finish_executing)
    yield
```

#### StandCloudConnector

Used to create the **StandCloud** connection addresses.

**Arguments:**

- `addr` *(str)*: StandCloud service name.
  For example: **standcloud.everypin.io**
- `api_mode` *(StandCloudAPIMode)*: StandCloud API mode:
  **jig** for test stand, **integration** for third-party service.
  Default: `StandCloudAPIMode.JIG`
- `api_version` *(int)*: StandCloud API version.
  Default: 1.

#### StandCloudReader

Used to read data from the **StandCloud**.
A login to **StandCloud** is required to work.
For more information, see the example [StandCloud reader](./../examples/stand_cloud_reader.md)

**Arguments:**

- `sc_connector` ([StandCloudConnector](#standcloudconnector)): **StandCloud** connection data.

**Functions:**

- `test_run` *(run_id: str, params: dict[str, Any])* - get run data from `/test_run` endpoint.
  All test run filters can view in REST documentation.
  Return `requests.Response` class with test run data.
- `tested_dut` *(params: dict[str, Any])* - get last tested DUT's data from `/tested_dut` endpoint.
  All tested dut's filters can view in REST documentation.
  Return `requests.Response` class with tested DUT's data.

In terms of filters, the difference between `test_run` and `tested_dut` in terms of filters
is that in test_run allows you to request a filter for the number of runs - `number_of_attempt`,
while tested_dut allows you to request a filter for the number of runs - `attempt_count`.
In other words, `tested_dut` will return the last run with the specified number of runs specified in `attempt_count`,
and `test_run` will return the runs whose start number is equal to the `number_of_attempt` specified in the filter.

**Examples:**

```python
    reader = StandCloudReader(StandCloudConnector(addr="standcloud.everypin.io"))

    response = reader.test_run(run_id="0196434d-e8f7-7ce1-81f7-e16f20487494")
    status_code = response.status_code
    response_data = response.json()
    print(response_data)

    param = {"part_number": "part_number_1", "status": "pass", "firmware_version": "1.2.3"}
    response = reader.test_run(params=param)
    status_code = response.status_code
    response_data = response.json()
    print(response_data)

    response = reader.tested_dut(param)
    status_code = response.status_code
    response_data = response.json()
    print(response_data)
```

#### Instrument

The class is used to store information about test equipment that forms part of the test bench. 
It is used with the [set_instrument](#set_instrument) function.

**Arguments:**

- `name` *(str | None)*: Instrument name  
- `revision` *(str | None)*: Instrument revision  
- `serial_number` *(str | None)*: Instrument serial number  
- `part_number` *(str | None)*: Instrument part number  
- `number` *(int | None)*: Instrument number  
- `comment` *(str | None)*: Instrument comment  
- `info` *(Mapping[str, str | int | float | None])*: Additional instrument info as key-value pairs  

**Returns:**

- *(int)*: instrument index

**Validation Rules:**

- `number` must be positive if specified (≥ 0)

**Example:**

```python
oscilloscope = Instrument(
    name="Oscilloscope",
    revision="1.2.3",
    serial_number="1325",
    part_number="EOSC_23",
    number=1,
    info={
        "model": "DSO-X 2024A",
        "bandwidth": "200MHz",
    }
)

set_instrument(oscilloscope)
```

#### SubUnit

This class contains information about the sub-unit of the DUT. 
It is used with the [set_dut_sub_unit](#set_dut_sub_unit) function.

**Arguments:**

- `serial_number` *(str | None)*: unit serial number
- `part_number` *(str | None)*: unit part number
- `name` *(str | None)*: unit name  
- `type` *(str | None)*: unit type
- `revision` *(str | None)*: unit revision  
- `info` *(Mapping[str, str | int | float  | None] | None)*: additional unit info as key-value pairs  

**Example:**

```python
def test_dut_sub_unit():
    sub_unit = SubUnit(
        serial_number="12345",
        part_number="part_number_1",
        name="Test Device",
        type="PCBA",
        revision="REV1.0",
        info={"sw_version": "1.0"},
    )
    jig.set_dut_sub_unit(sub_unit)
```

### NumericMeasurement

This class contains information about numeric measurement. 
It is used with the [set_case_measurement](#set_case_measurement) function.

**Arguments:**

- `value` *(float | int)*: numeric measure value.
- `name` *(str | None)*: numeric measure name.
- `unit` *(str | None)*: unit of numeric measure.
- `operation`: comparison operators of numeric measure.
- `comparison_value` *(ComparisonOperation | None)*: value to compare against.
- `lower_limit`: *(float | int)*: lower limit for range operations.
- `upper_limit` *(float | int)*:upper limit for range operations.

**Returns:**

- *(int)*: measurement index

**Example:**

```python
def test_measurement():
    meas_1 = NumericMeasurement(value=10, operation=ComparisonOperation.EQ, comparison_value=10)
    set_case_measurement(meas_1)
    meas_2 = NumericMeasurement(value=3, unit="V", operation=ComparisonOperation.GTLT, lower_limit=2.9, upper_limit=3.5)
    set_case_measurement(meas_2)
    meas_3 = NumericMeasurement(value=1.0)
    set_case_measurement(meas_3)

    assert meas_1.result
    assert meas_2.result
```

### StringMeasurement

This class contains information about string measurement. 
It is used with the [set_case_measurement](#set_case_measurement) function.

**Arguments:**

- `value` *(str)*: string measure value.
- `name` *(str | None)*: string measure name.
- `operation`: comparison operators of string measure (**EQ** and **NE**).
- `comparison_value`: *(ComparisonOperation | None)*: value to compare against.
- `casesensitive`: *bool=True*: case sensitivity.

**Example:**

```python
def test_measurement():
    meas_1 = StringMeasurement(value="1.2.0", operation=ComparisonOperation.EQ, comparison_value="1.2.0")
    set_case_measurement(meas_1)

    meas_2 = StringMeasurement(value="abc", operation=ComparisonOperation.EQ, casesensitive=False, comparison_value="ABC")
    set_case_measurement(meas_2)

    assert meas_1.result
    assert meas_2.result
```

### Chart

This class contains information about chart (data series). 
It is used with the [set_case_chart](#set_case_chart) function.

A `ValidationError` will result if the lengths of x_data, y_data, and marker_name differ.

A series is drawn as a line with markers unless it carries a
[SeriesStyle](#seriesstyle). A `None` inside a data series is a gap: the line
is broken there, so one series can hold several disjoint segments (the
vectors of a distortion map, for instance). A gap must be `None` in both
`x_data` and `y_data`, and a series needs at least one point.

**Arguments:**

- `type` *([ChartType](#charttype))*: chart type, LINE by default.
- `title` *(str | None)*: chart title.
- `x_label` *(str | None)*: x label name.
- `y_label` *(str | None)*: y label name.
- `marker_name` *(list[str | None])*: data series marker name.
- `x_data` *(list[list[int | float | None]])*: x data series. Each data series is its own list.
- `y_data` *(list[list[int | float | None]])*: y data series. Each data series is its own list.
- `series_style` *(list[[SeriesStyle](#seriesstyle) | None])*: how each series is
  drawn. Either empty, or one entry per series with `None` for a series drawn
  with the defaults.
- `equal_aspect` *(bool=False)*: draw one unit of X as long as one unit of Y.
  For charts of positions, where a square field must look square, rather than
  of a quantity over another.

**Functions:**

- `add_series` *(x_data: list[int | float | None], y_data:*
  *list[int | float | None], marker_name: str | None = None,*
  *style: [SeriesStyle](#seriesstyle) | None = None)*: add data series to current `Chart`.
- `to_dict` *()*: the chart as stored in the run document, plain JSON.

**Example:**

```python
def test_chart():
    chart = jig.Chart(
        type=jig.ChartType.LINE,
        title="title",
        x_label="x_label",
        y_label="y_label",
        marker_name=["marker_name", None],
        x_data=[ [1, 2], [1, 2] ],
        y_data=[ [3, 4], [3, 4] ]
    )
    chart.add_series(x_data=[0, 3], y_data=[2, 4], marker_name="A")
    jig.set_case_chart(chart)
```

**Example of a styled chart of positions:**

```python
def test_landing_map():
    chart = jig.Chart(
        title="Where the shots landed",
        x_label="X (um)",
        y_label="Y (um)",
        equal_aspect=True,
    )
    chart.add_series(
        x_data=[-500, 500, 500, -500, -500],
        y_data=[-400, -400, 400, 400, -400],
        marker_name="Screen",
        style=jig.SeriesStyle(mode=jig.SeriesMode.LINES, line_dash=jig.LineDash.DASH, color="#888888"),
    )
    chart.add_series(
        x_data=[0, 100, 0, 100],
        y_data=[0, 0, 100, 100],
        marker_name="Aimed",
        style=jig.SeriesStyle(mode=jig.SeriesMode.MARKERS, marker_symbol=jig.MarkerSymbol.CIRCLE_OPEN, color="#888888"),
    )
    chart.add_series(
        x_data=[1.0, 102.5, -0.5, 103.0],
        y_data=[0.5, 1.0, 101.0, 104.0],
        marker_name="Landed",
        style=jig.SeriesStyle(
            mode=jig.SeriesMode.MARKERS,
            color_values=[1.1, 2.7, 1.1, 5.0],
            colorbar_title="Radial error (um)",
            hover_text=["aimed (0, 0)", "aimed (100, 0)", "aimed (0, 100)", "aimed (100, 100)"],
        ),
    )
    jig.set_case_chart(chart)
```

### SeriesStyle

How one series of a [Chart](#chart) is drawn. Every argument is optional:
an argument left unset keeps the panel's default, so a style only has to say
what differs from a plain line with markers.

A `ValidationError` will result if `color` and `color_values` are both set,
if `colorbar_title` is set without `color_values`, or if `hover_text` or
`color_values` do not have one entry per point of their series.

**Arguments:**

- `mode` *([SeriesMode](#seriesmode) | None)*: lines, markers, or both (the default).
- `color` *(str | None)*: one CSS colour for the whole series, e.g. `"#c02020"`.
- `marker_symbol` *([MarkerSymbol](#markersymbol) | None)*: marker shape.
- `marker_size` *(int | None)*: marker size in pixels.
- `line_dash` *([LineDash](#linedash) | None)*: dash pattern of the line.
- `line_width` *(float | None)*: line width in pixels.
- `opacity` *(float | None)*: 0 (invisible) to 1 (opaque).
- `hover_text` *(list[str] | None)*: one label per point, shown with the series name when the point is hovered.
- `color_values` *(list[int | float] | None)*: one value per point. The markers are coloured on a scale and a colour bar is drawn.
- `colorbar_title` *(str | None)*: title of that colour bar.
- `show_legend` *(bool=True)*: whether the series appears in the legend.

### ErrorCode

This class saves the error code of the test plan to the database.
Only the first error code from this class is saved.

The `ErrorCode` class must be called from the `assert`. 
Otherwise, an extra error code may be saved.

**Arguments:**

- `error_code` *(int)*: error code (non-negative integer).
- `message` *(str | None)*: error code message.

**Example:**

```python
def test_error_code():
    assert False, jig.ErrorCode(1, "error code message")
```

## Enum

### ComparisonOperation

A comparison operation for the measurements.

**Values:**

- *EQ*: equal.
- *NE*: not equal.
- *GT*: greater than.
- *GE*: greater or equal.
- *LT*: less than.
- *LE*: less or equal.
- *GTLT*: greater than lower limit, less than upper limit.
- *GELE*: greater or equal than lower limit, less or equal than upper limit.
- *GELT*: greater or equal than lower limit, less than upper limit.
- *GTLE*: greater than lower limit, less or equal than upper limit.
- *LTGT*: less than lower limit or greater than upper limit.
- *LEGE*: less or equal than lower limit or greater or equal than upper limit.
- *LEGT*: less or equal than lower limit or greater than upper limit.
- *LTGE*: less than lower limit or greater or equal than upper limit.

### ChartType

This is a chart type for the [Chart](#chart) class.

**Values:**

- *LINE*: line.
- *LINE_LOG_X*: line_log_x.
- *LINE_LOG_Y*: line_log_y.
- *LOG_X_Y*: log_x_y.

### SeriesMode

How the points of a series are drawn, for [SeriesStyle](#seriesstyle).

**Values:**

- *LINES*: a line through the points, no markers.
- *MARKERS*: a marker on each point, no line.
- *LINES_MARKERS*: both, the default of an unstyled series.

### LineDash

Dash pattern of a series line, for [SeriesStyle](#seriesstyle).

**Values:**

- *SOLID*, *DASH*, *DOT*, *DASHDOT*.

### MarkerSymbol

Shape of a series marker, for [SeriesStyle](#seriesstyle). The open shapes
are outlines only, which lets an aimed position show through a landing drawn
over it.

**Values:**

- *CIRCLE*, *CIRCLE_OPEN*, *SQUARE*, *SQUARE_OPEN*, *DIAMOND*, *DIAMOND_OPEN*,
  *CROSS*, *X*, *TRIANGLE_UP*, *TRIANGLE_DOWN*, *STAR*.

## Fixture

#### post_run_functions

To execute actions at the end of testing, you can use the fixture **post_run_functions**.
This fixture is a `list[Callable]` and you can write functions into it that must be executed at the end of testing.

Fill this list in conftest.py and functions from this list will be called after tests run (at the end of pytest_sessionfinish).

**Returns:**

- *(list[Callable])*: list of post run methods

**Example:**

```python
# conftest.py file
def finish_executing():
    print("Pytest finished")


@pytest.fixture(scope="session", autouse=True)
def fill_actions_after_test(post_run_functions: list):
    post_run_functions.append(finish_executing)
    yield
```

#### jig_start_args

To access **Jig** start arguments passed via command line, you can use the `jig_start_args` fixture.
This fixture returns a `dict` containing parsed key-value pairs from `--jig-start-arg` options.

**Returns:**

- *(dict)*: dictionary of start arguments (key-value pairs)

**Example:**

```python
def test_with_start_args(jig_start_args):
   
    if jig_start_args.get("test_mode") == "debug":
        jig.set_message("Running in debug mode")
```

## Marker

#### case_name

Sets a text name for the test case (default: function name)

**Example:**

```python
@pytest.mark.case_name("Simple case 1")
def test_one():
    assert True
```

#### module_name

Sets a text name for the test module (file) (default: module name)

**Example:**

```python
pytestmark = pytest.mark.module_name("Module 1")
```

#### case_group

Sets the group for a test case. Valid groups: `setup`, `main`, `teardown` (default: `main`)

**Example:**

```python
from jig import Group

@pytest.mark.case_group(Group.SETUP)
def test_setup_case():
    assert True

@pytest.mark.case_group("teardown")  
def test_teardown_case():
    assert True
```

#### module_group

Sets the group for all test cases in a module. Valid groups: `setup`, `main`, `teardown` (default: `main`)

**Example:**

```python
import pytest
from jig import Group

pytestmark = pytest.mark.module_group(Group.TEARDOWN)

def test_cleanup1():
    assert True

def test_cleanup2():
    assert True
```

#### module_section

Places a module in a named **section** in the operator panel. Sections are
distinct from [module_group](#module_group) (the setup/main/teardown lifecycle
phase).

By default, a module's section is derived from its directory path relative to
the tests root. Nesting is recursive:

```text
autofocus/
  test_1_coarse_search.py       # section ["autofocus"]
  fine/
    test_1_dither.py            # section ["autofocus", "fine"]
test_7_alignment.py             # section [] (root)
```

The `module_section` marker overrides the directory-derived path. It accepts
either varargs or a single slash-separated string:

```python
import pytest

pytestmark = pytest.mark.module_section("Alignment")

def test_offset():
    assert True
```

```python
pytestmark = pytest.mark.module_section("Autofocus", "Fine")
# equivalent: pytest.mark.module_section("Autofocus/Fine")
```

When tests live in subdirectories, add `--import-mode=importlib` to
`pytest.ini` so modules with the same basename in different folders do not
collide:

```ini
[pytest]
addopts = --import-mode=importlib
```

Module ids become path-based (`autofocus/test_1` instead of `test_1`). Use the
same form in [dependency](#dependency) markers:

```python
@pytest.mark.dependency("autofocus/test_1::test_peak")
def test_follow_up():
    assert True
```

#### dependency

Skips the test case/module if the main test fails/skipped/errored.
For more information, see the example [skip test](./../examples/skip_test.md)
and [skip feature description](./../features/features.md#skipping-the-tests).

**Example:**

```python
#test_1.py
def test_one():
    assert False

@pytest.mark.dependency("test_1::test_one")
def test_two():
    assert True
```

#### attempt

If a test is marked `attempt`, it will be repeated if it fails the number of
attempts specified by the mark.
The test will be repeated until it is passed.
There is a 1 second pause between attempts.
Each attempt clears the case data, including the message, 
the assertion message, the chart, the measurements, and the artifact.
For more information, see the example [attempts](./../examples/attempts.md).

**Example:**

```python
@pytest.mark.attempt(5)
def test_attempts():
    assert False
```

#### critical

Marks test or module as critical.
Failing/skipped critical tests skip all subsequent tests.
For implementation details see [critical tests example](./../examples/critical_test.md).

**Example (test level):**

```python
@pytest.mark.critical
def test_core_feature():
    assert check_core_functionality()
```

**Example (module level):**

```python
pytestmark = pytest.mark.critical

def test_db_connection():
    assert connect_to_database()
```

**Behavior:**

- Critical test passes - Continue normally
- Critical test fails/skips - Skip all remaining tests
- Any test fails in critical module - Skip all remaining tests

## Options

**pytest-jig** has several options to run:

#### jig-pt

Option to enable the **pytest-jig** plugin.

```bash
--jig-pt
```

#### jig-db-url

The CouchDB instance url for the **statestore** and **runstore** databases.
The default is `http://dev:dev@localhost:5984/`.

```bash
--jig-db-url
```

#### jig-tests-name

The **Jig** tests name.
The default value is **Tests**.

```bash
--jig-tests-name
```

#### jig-current-test-config

The **Jig** tests config name.

```bash
--jig-current-test-config
```

#### jig-clear-database

Option to clean **statestore** and **runstore** databases before running pytest.

```bash
--jig-clear-database
```

#### sc-address

**StandCloud** address.
The default is empty string.

```bash
--sc-address
```

#### sc-connection-only

Check **StandCloud** service availability.
The default is *False*.

```bash
--sc-connection-only
```

#### sc-autosync

Enable **Jig** to **StandCloud** test report data auto synchroniztion.
The default is *False*.

```bash
--sc-autosync
```

#### jig-config-file

The Jig configuration file path ([jig.toml](./jig_config.md)).
The default is the tests path.

```bash
--jig-config-file path/to/file/
```

#### jig-start-arg

Dynamic arguments for test execution in key=value format. Can be specified multiple times.

```bash
--jig-start-arg key=value
```
