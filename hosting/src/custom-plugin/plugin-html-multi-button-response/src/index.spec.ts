import { startTimeline } from "@jspsych/test-utils";

import HTMLMultiButtonResponse from ".";

jest.useFakeTimers();

describe("html-multi-button-response", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: HTMLMultiButtonResponse,
        stimulus: "test"
      },
    ]);

    await expectFinished();
  });
});
