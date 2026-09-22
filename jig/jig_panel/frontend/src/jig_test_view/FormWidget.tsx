// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import React from "react";
import {
  Checkbox,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  Tag,
} from "@blueprintjs/core";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type {
  ChoiceFieldInfo,
  FormErrors,
  FormFieldInfo,
  FormFieldError,
  FormValues,
  NumberFieldInfo,
  TextFieldInfo,
} from "@/lib/formWidget";

interface FormWidgetProps {
  fields: FormFieldInfo[];
  values: FormValues;
  errors: FormErrors;
  fontSize: number;
  onChange: (name: string, value: string | boolean) => void;
  /** Enter pressed in a field: confirm, or reach the Pass button. */
  onEnter: () => void;
}

/**
 * The sentence shown under a field that cannot be confirmed as it stands.
 * @param {FormFieldError} error - Why the field is refused.
 * @param {TFunction} t - The translation function.
 * @returns {string} The translated sentence.
 */
export function describeFormError(error: FormFieldError, t: TFunction): string {
  switch (error.kind) {
    case "required":
      return t("operatorDialog.form.required");
    case "notANumber":
      return t("operatorDialog.form.notANumber");
    case "belowMinimum":
      return t("operatorDialog.form.belowMinimum", { minimum: error.minimum });
    case "aboveMaximum":
      return t("operatorDialog.form.aboveMaximum", { maximum: error.maximum });
  }
}

/**
 * The fields of a form dialog, each prefilled with its default and validated
 * as the operator types. The error of a field is shown under that field, so
 * the operator sees which value to fix instead of a single alert.
 *
 * The first field takes the focus so the operator can tab through the form.
 * @param {FormWidgetProps} props - The fields, their values and errors.
 * @returns {JSX.Element} The rendered form.
 */
export function FormWidgetComponent({
  fields,
  values,
  errors,
  fontSize,
  onChange,
  onEnter,
}: Readonly<FormWidgetProps>): JSX.Element {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <div
      className="form-widget"
      data-testid="form-widget"
      style={{ fontSize: `${fontSize}px`, textAlign: "left" }}
    >
      {fields.map((field, index) => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(value) => onChange(field.name, value)}
          onKeyDown={handleKeyDown}
          autoFocus={index === 0}
          t={t}
        />
      ))}
    </div>
  );
}

interface FormFieldProps {
  field: FormFieldInfo;
  value: string | boolean | undefined;
  error: FormFieldError | undefined;
  onChange: (value: string | boolean) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  autoFocus: boolean;
  t: TFunction;
}

function FormField({
  field,
  value,
  error,
  onChange,
  onKeyDown,
  autoFocus,
  t,
}: Readonly<FormFieldProps>): JSX.Element {
  const inputId = `form-field-${field.name}`;
  const intent = error ? Intent.DANGER : Intent.NONE;
  const helperText = error
    ? describeFormError(error, t)
    : (field.hint ?? undefined);

  if (field.type === "boolean") {
    // The checkbox carries its own label; a group label would repeat it.
    return (
      <FormGroup helperText={helperText} intent={intent}>
        <Checkbox
          id={inputId}
          label={field.label}
          checked={value === true}
          onChange={(event: React.FormEvent<HTMLInputElement>) =>
            onChange(event.currentTarget.checked)
          }
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        />
      </FormGroup>
    );
  }

  return (
    <FormGroup
      label={field.label}
      labelFor={inputId}
      labelInfo={field.required ? undefined : t("operatorDialog.form.optional")}
      helperText={helperText}
      intent={intent}
    >
      {renderInput(field, inputId, value, intent, onChange, onKeyDown, autoFocus)}
    </FormGroup>
  );
}

function renderInput(
  field: NumberFieldInfo | TextFieldInfo | ChoiceFieldInfo,
  inputId: string,
  value: string | boolean | undefined,
  intent: Intent,
  onChange: (value: string) => void,
  onKeyDown: (event: React.KeyboardEvent) => void,
  autoFocus: boolean,
): JSX.Element {
  const text = typeof value === "string" ? value : "";

  if (field.type === "choice") {
    // An empty entry lets a choice start unselected instead of silently on
    // the first option; a required choice loses it once an option is picked.
    const canBeEmpty = !field.required || text === "";
    return (
      <HTMLSelect
        id={inputId}
        value={text}
        options={[
          ...(canBeEmpty ? [{ value: "", label: "" }] : []),
          ...field.options.map((option) => ({ value: option, label: option })),
        ]}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onChange(event.currentTarget.value)
        }
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        fill
      />
    );
  }

  return (
    <InputGroup
      id={inputId}
      type={field.type === "number" ? "number" : "text"}
      step={field.type === "number" ? "any" : undefined}
      value={text}
      placeholder={
        field.type === "text" ? (field.placeholder ?? undefined) : undefined
      }
      intent={intent}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      rightElement={
        field.type === "number" && field.unit ? (
          <Tag minimal>{field.unit}</Tag>
        ) : undefined
      }
    />
  );
}

export default FormWidgetComponent;
