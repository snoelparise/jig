// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import { describe, expect, test } from "vitest";

import {
  formAnswer,
  initialFormValues,
  isFormFieldList,
  validateFormValues,
  type FormFieldInfo,
} from "./formWidget";

describe("initialFormValues", () => {
  test(`given fields with defaults,
 when the form opens,
 then every field is prefilled with its default`, () => {
    const fields: FormFieldInfo[] = [
      {
        type: "number",
        name: "power",
        label: "Laser power",
        default: 20,
        unit: "%",
        required: true,
      },
      { type: "text", name: "calibration", label: "Id", default: "7", required: true },
      {
        type: "choice",
        name: "speed",
        label: "Speed",
        options: ["slow", "fast"],
        default: "fast",
        required: true,
      },
      { type: "boolean", name: "verify", label: "Verify", default: true },
    ];

    expect(initialFormValues(fields)).toEqual({
      power: "20",
      calibration: "7",
      speed: "fast",
      verify: true,
    });
  });

  test(`given fields without defaults,
 when the form opens,
 then inputs are empty and the switch is off`, () => {
    const fields: FormFieldInfo[] = [
      { type: "number", name: "power", label: "Power", required: true },
      { type: "text", name: "note", label: "Note", required: false },
      { type: "choice", name: "speed", label: "Speed", options: ["slow"], required: true },
      { type: "boolean", name: "verify", label: "Verify" },
    ];

    expect(initialFormValues(fields)).toEqual({
      power: "",
      note: "",
      speed: "",
      verify: false,
    });
  });
});

describe("validateFormValues", () => {
  const power: FormFieldInfo = {
    type: "number",
    name: "power",
    label: "Laser power",
    minimum: 1,
    maximum: 100,
    required: true,
  };

  test(`given a number within its range,
 when validated,
 then there is nothing to report`, () => {
    expect(validateFormValues([power], { power: "20" })).toEqual({});
  });

  test(`given a required number left empty,
 when validated,
 then the field is reported as required`, () => {
    expect(validateFormValues([power], { power: "  " })).toEqual({
      power: { kind: "required" },
    });
  });

  test(`given text in a number field,
 when validated,
 then the field is reported as not a number`, () => {
    expect(validateFormValues([power], { power: "twenty" })).toEqual({
      power: { kind: "notANumber" },
    });
  });

  test(`given a number below the minimum,
 when validated,
 then the minimum is reported`, () => {
    expect(validateFormValues([power], { power: "0.5" })).toEqual({
      power: { kind: "belowMinimum", minimum: 1 },
    });
  });

  test(`given a number above the maximum,
 when validated,
 then the maximum is reported`, () => {
    expect(validateFormValues([power], { power: "150" })).toEqual({
      power: { kind: "aboveMaximum", maximum: 100 },
    });
  });

  test(`given an optional number left empty,
 when validated,
 then there is nothing to report`, () => {
    const optional: FormFieldInfo = {
      type: "number",
      name: "offset",
      label: "Offset",
      required: false,
    };

    expect(validateFormValues([optional], { offset: "" })).toEqual({});
  });

  test(`given a required text and a required choice left empty,
 when validated,
 then both are reported`, () => {
    const fields: FormFieldInfo[] = [
      { type: "text", name: "id", label: "Id", required: true },
      { type: "choice", name: "speed", label: "Speed", options: ["slow"], required: true },
    ];

    expect(validateFormValues(fields, { id: "", speed: "" })).toEqual({
      id: { kind: "required" },
      speed: { kind: "required" },
    });
  });

  test(`given a switch,
 when validated,
 then it can never be wrong`, () => {
    const fields: FormFieldInfo[] = [{ type: "boolean", name: "verify", label: "Verify" }];

    expect(validateFormValues(fields, { verify: false })).toEqual({});
  });
});

describe("formAnswer", () => {
  test(`given typed values,
 when answered,
 then text is trimmed and the switch stays a boolean`, () => {
    const fields: FormFieldInfo[] = [
      { type: "number", name: "power", label: "Power", required: true },
      { type: "text", name: "id", label: "Id", required: true },
      { type: "boolean", name: "verify", label: "Verify" },
    ];

    expect(formAnswer(fields, { power: " 25 ", id: " 12 ", verify: true })).toEqual({
      power: "25",
      id: "12",
      verify: true,
    });
  });
});

describe("isFormFieldList", () => {
  test(`given the option labels of a radio button,
 when inspected,
 then they are not form fields`, () => {
    expect(isFormFieldList(["one", "two"])).toBe(false);
  });

  test(`given no fields at all,
 when inspected,
 then they are not form fields`, () => {
    expect(isFormFieldList(undefined)).toBe(false);
    expect(isFormFieldList([])).toBe(false);
  });

  test(`given the fields of a form,
 when inspected,
 then they are form fields`, () => {
    expect(
      isFormFieldList([{ type: "boolean", name: "verify", label: "Verify" }]),
    ).toBe(true);
  });
});
