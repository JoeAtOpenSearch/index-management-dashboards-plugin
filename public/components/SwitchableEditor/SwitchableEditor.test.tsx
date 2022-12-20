/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import SwitchableEditor from "./index";
import userEvent from "@testing-library/user-event";

describe("<SwitchableEditor /> spec", () => {
  it("renders the component", async () => {
    const onChangeMock = jest.fn(console.log);
    const { findByText, getByText, queryByText } = render(
      <SwitchableEditor onChange={onChangeMock} mode="diff" value={JSON.stringify({ name: "test" })} />
    );
    expect(document.body.children).toMatchSnapshot();
    userEvent.click(document.querySelector(".euiSwitch__button") as HTMLElement);
    await findByText("Edit in diff mode");
    expect(document.body.children).toMatchSnapshot();
    userEvent.click(document.querySelector('[aria-label="Closes this modal window"]') as HTMLElement);
    await waitFor(() => expect(queryByText("Edit in diff mode")).toBeNull(), { timeout: 3000 });
    userEvent.click(document.querySelector(".euiSwitch__button") as HTMLElement);
    await findByText("Edit in diff mode");
    const textarea = document.querySelector('.euiModalBody [data-test-subj="jsonEditor-valueDisplay"]') as HTMLElement;
    userEvent.type(textarea, "123");
    userEvent.click(getByText("OK"));
    await findByText(/Your input does not match the validation of json format/, undefined, {
      timeout: 3000,
    });
    userEvent.clear(textarea);
    userEvent.paste(textarea, `{ "name": "test" }`);
    userEvent.click(getByText("OK"));
    await waitFor(() => {});
    expect(onChangeMock).toBeCalledWith(`{ "name": "test" }`);
  });
});
