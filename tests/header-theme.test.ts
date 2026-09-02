import { describe, expect, it } from "vitest";
import { normalizeHeaderTheme, nextHeaderTheme, HEADER_THEME_STORAGE_KEY } from "../lib/header-theme";

describe("header theme", () => {
  it("uses dark as the default and only accepts dark or light", () => {
    expect(normalizeHeaderTheme(null)).toBe("dark");
    expect(normalizeHeaderTheme("light")).toBe("light");
    expect(normalizeHeaderTheme("dark")).toBe("dark");
    expect(normalizeHeaderTheme("other")).toBe("dark");
  });

  it("toggles between dark and light", () => {
    expect(nextHeaderTheme("dark")).toBe("light");
    expect(nextHeaderTheme("light")).toBe("dark");
  });

  it("uses a dedicated persistent storage key", () => {
    expect(HEADER_THEME_STORAGE_KEY).toBe("tcf-learn-header-theme");
  });
});
