import { describe, it, expect, beforeEach } from "vitest";
import { getScroll, saveScroll } from "./scroll";

describe("scroll memory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 0 for an unknown path", () => {
    expect(getScroll("/never/opened.md")).toBe(0);
  });

  it("stores and retrieves a scroll offset", () => {
    saveScroll("/a/b.md", 320);
    expect(getScroll("/a/b.md")).toBe(320);
  });

  it("overwrites a previous offset for the same path", () => {
    saveScroll("/a/b.md", 100);
    saveScroll("/a/b.md", 250);
    expect(getScroll("/a/b.md")).toBe(250);
  });

  it("keeps offsets independent per path", () => {
    saveScroll("/one.md", 10);
    saveScroll("/two.md", 20);
    expect(getScroll("/one.md")).toBe(10);
    expect(getScroll("/two.md")).toBe(20);
  });
});
