import { describe, expect, it } from "vitest";
import { PRIMARY_HOME_PATH } from "../lib/home-route";

describe("primary home route", () => {
  it("uses the dashboard as the primary home experience", () => {
    expect(PRIMARY_HOME_PATH).toBe("/dashboard");
  });
});
