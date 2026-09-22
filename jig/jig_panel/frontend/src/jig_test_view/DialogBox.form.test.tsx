// Copyright (c) 2026 Everypin
// GNU General Public License v3.0 (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { StartConfirmationDialog, WidgetType } from "./DialogBox";

vi.mock("axios", () => ({
  default: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

const postMock = vi.mocked(axios.post);

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "en",
      resources: {
        en: {
          translation: {
            button: { confirm: "Confirm", pass: "Pass", fail: "Fail" },
            operatorDialog: {
              form: {
                required: "This field is required",
                notANumber: "Enter a number",
                belowMinimum: "Must be at least {{minimum}}",
                aboveMaximum: "Must be at most {{maximum}}",
                optional: "(optional)",
                noChoice: "— choose —",
              },
            },
          },
        },
      },
    });
  }
});

beforeEach(() => {
  postMock.mockClear();
});

afterEach(cleanup);

const burnSettingsFields = [
  {
    type: "number" as const,
    name: "power_percent",
    label: "Laser power",
    default: 20,
    unit: "%",
    minimum: 0.1,
    maximum: 100,
    required: true,
    hint: "Share of the laser's full power",
  },
  {
    type: "text" as const,
    name: "calibration_id",
    label: "Power calibration",
    default: "7",
    placeholder: null,
    required: true,
    hint: null,
  },
  {
    type: "boolean" as const,
    name: "verify",
    label: "Verify after burn",
    default: true,
    hint: null,
  },
];

const renderFormDialog = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <StartConfirmationDialog
        title_bar="Galvo burn"
        dialog_text="Set the burn, then confirm."
        widget_type={WidgetType.Form}
        widget_info={{ fields: burnSettingsFields }}
        is_visible={true}
        id="dlg-form-1"
        font_size={14}
        pass_fail={false}
      />
    </I18nextProvider>,
  );

describe("StartConfirmationDialog with a form widget", () => {
  test(`given fields with defaults,
 when the dialog opens,
 then every input is prefilled and labelled`, () => {
    renderFormDialog();

    expect(screen.getByLabelText("Laser power")).toHaveValue(20);
    expect(screen.getByLabelText("Power calibration")).toHaveValue("7");
    expect(screen.getByLabelText("Verify after burn")).toBeChecked();
    expect(screen.getByText("%")).toBeTruthy();
    expect(screen.getByText("Share of the laser's full power")).toBeTruthy();
  });

  test(`given the defaults left as they are,
 when the operator confirms,
 then the answer is sent as one object`, async () => {
    renderFormDialog();

    fireEvent.click(screen.getByText("Confirm"));

    expect(postMock).toHaveBeenCalledWith("/api/confirm_dialog_box", {
      result: "confirm",
      data: { power_percent: "20", calibration_id: "7", verify: true },
    });
  });

  test(`given a power over its maximum,
 when the operator confirms,
 then the error is shown under that field and nothing is sent`, () => {
    renderFormDialog();

    fireEvent.change(screen.getByLabelText("Laser power"), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByText("Confirm"));

    expect(screen.getByText("Must be at most 100")).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });

  test(`given a required field emptied,
 when the operator confirms,
 then the field is reported as required`, () => {
    renderFormDialog();

    fireEvent.change(screen.getByLabelText("Power calibration"), {
      target: { value: "  " },
    });
    fireEvent.click(screen.getByText("Confirm"));

    expect(screen.getByText("This field is required")).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });

  test(`given an error shown under a field,
 when the operator edits that field,
 then the error goes away`, () => {
    renderFormDialog();
    fireEvent.change(screen.getByLabelText("Laser power"), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByText("Confirm"));

    fireEvent.change(screen.getByLabelText("Laser power"), {
      target: { value: "35" },
    });

    expect(screen.queryByText("Must be at most 100")).toBeNull();
  });

  test(`given edited values,
 when Enter is pressed in an input,
 then the edited answer is sent`, () => {
    renderFormDialog();
    fireEvent.change(screen.getByLabelText("Laser power"), {
      target: { value: "35.5" },
    });
    fireEvent.click(screen.getByLabelText("Verify after burn"));

    fireEvent.keyDown(screen.getByLabelText("Laser power"), { key: "Enter" });

    expect(postMock).toHaveBeenCalledWith("/api/confirm_dialog_box", {
      result: "confirm",
      data: { power_percent: "35.5", calibration_id: "7", verify: false },
    });
  });
});
