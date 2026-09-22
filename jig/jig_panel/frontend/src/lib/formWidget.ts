// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

/**
 * The fields of a form dialog, as `FormWidget` serialises them on the Python
 * side, and the pure logic behind the form: which value each field starts
 * with, whether the current values may be confirmed, and what is answered.
 */

interface FormFieldBase {
  name: string;
  label: string;
  hint?: string | null;
}

export interface NumberFieldInfo extends FormFieldBase {
  type: "number";
  default?: number | null;
  unit?: string | null;
  minimum?: number | null;
  maximum?: number | null;
  required: boolean;
}

export interface TextFieldInfo extends FormFieldBase {
  type: "text";
  default?: string | null;
  placeholder?: string | null;
  required: boolean;
}

export interface ChoiceFieldInfo extends FormFieldBase {
  type: "choice";
  options: string[];
  default?: string | null;
  required: boolean;
}

export interface BooleanFieldInfo extends FormFieldBase {
  type: "boolean";
  default?: boolean | null;
}

export type FormFieldInfo =
  | NumberFieldInfo
  | TextFieldInfo
  | ChoiceFieldInfo
  | BooleanFieldInfo;

/** What the operator has typed or ticked so far, keyed by field name. */
export type FormValues = Record<string, string | boolean>;

/** What is posted for a form: text as typed, switches as booleans. */
export type FormAnswer = Record<string, string | boolean>;

/** Why a field cannot be confirmed as it stands. */
export type FormFieldError =
  | { kind: "required" }
  | { kind: "notANumber" }
  | { kind: "belowMinimum"; minimum: number }
  | { kind: "aboveMaximum"; maximum: number };

export type FormErrors = Record<string, FormFieldError>;

/**
 * Tells the fields of a form from the option labels of a radio button or
 * checkbox widget, which share the `fields` key of the widget info.
 * @param {string[] | FormFieldInfo[] | undefined} fields - The `fields` of a widget.
 * @returns {boolean} True when they describe form fields.
 */
export function isFormFieldList(
  fields: string[] | FormFieldInfo[] | undefined,
): fields is FormFieldInfo[] {
  return Array.isArray(fields) && fields.length > 0 && typeof fields[0] === "object";
}

/**
 * The values a form opens with: every field prefilled with its default.
 * @param {FormFieldInfo[]} fields - The fields of the form.
 * @returns {FormValues} One entry per field.
 */
export function initialFormValues(fields: FormFieldInfo[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    switch (field.type) {
      case "number":
        values[field.name] =
          field.default === null || field.default === undefined
            ? ""
            : String(field.default);
        break;
      case "text":
      case "choice":
        values[field.name] = field.default ?? "";
        break;
      case "boolean":
        values[field.name] = field.default ?? false;
        break;
    }
  }
  return values;
}

/**
 * Checks every field against its own rules.
 * @param {FormFieldInfo[]} fields - The fields of the form.
 * @param {FormValues} values - The current values.
 * @returns {FormErrors} The fields that cannot be confirmed; empty when all can.
 */
export function validateFormValues(
  fields: FormFieldInfo[],
  values: FormValues,
): FormErrors {
  const errors: FormErrors = {};
  for (const field of fields) {
    const error = validateField(field, values[field.name]);
    if (error) {
      errors[field.name] = error;
    }
  }
  return errors;
}

/**
 * The answer posted to the server. Text is trimmed and switches stay
 * booleans; the Python field converts each value to its own type.
 * @param {FormFieldInfo[]} fields - The fields of the form.
 * @param {FormValues} values - The confirmed values.
 * @returns {FormAnswer} One entry per field.
 */
export function formAnswer(fields: FormFieldInfo[], values: FormValues): FormAnswer {
  const answer: FormAnswer = {};
  for (const field of fields) {
    const value = values[field.name];
    answer[field.name] = typeof value === "string" ? value.trim() : value;
  }
  return answer;
}

function validateField(
  field: FormFieldInfo,
  value: string | boolean | undefined,
): FormFieldError | null {
  if (field.type === "boolean") {
    return null;
  }
  const text = typeof value === "string" ? value.trim() : "";
  if (text === "") {
    return field.required ? { kind: "required" } : null;
  }
  if (field.type === "number") {
    return validateNumber(field, text);
  }
  return null;
}

function validateNumber(
  field: NumberFieldInfo,
  text: string,
): FormFieldError | null {
  const value = Number(text);
  if (!Number.isFinite(value)) {
    return { kind: "notANumber" };
  }
  if (field.minimum !== null && field.minimum !== undefined) {
    if (value < field.minimum) {
      return { kind: "belowMinimum", minimum: field.minimum };
    }
  }
  if (field.maximum !== null && field.maximum !== undefined) {
    if (value > field.maximum) {
      return { kind: "aboveMaximum", maximum: field.maximum };
    }
  }
  return null;
}
