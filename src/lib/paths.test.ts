import { describe, it, expect } from "vitest";
import { dirName, isExternalUrl, isMarkdownLink, resolvePath } from "./paths";

describe("dirName", () => {
  it("returns the directory of a posix path", () => {
    expect(dirName("/a/b/c.md")).toBe("/a/b");
  });
  it("returns empty string when there is no directory", () => {
    expect(dirName("c.md")).toBe("");
  });
  it("normalises Windows separators", () => {
    expect(dirName("C:\\notes\\file.md")).toBe("C:/notes");
  });
});

describe("isExternalUrl", () => {
  it.each([
    "http://example.com",
    "https://example.com/x",
    "mailto:a@b.com",
    "tel:123",
    "data:text/plain,hi",
    "#section",
  ])("treats %s as external", (href) => {
    expect(isExternalUrl(href)).toBe(true);
  });

  it.each(["./rel.md", "rel.png", "sub/dir/file.md", "../up.md"])(
    "treats %s as local",
    (href) => {
      expect(isExternalUrl(href)).toBe(false);
    }
  );
});

describe("isMarkdownLink", () => {
  it.each(["a.md", "a.markdown", "a.mdown#heading", "PATH.MD"])(
    "matches %s",
    (href) => {
      expect(isMarkdownLink(href)).toBe(true);
    }
  );
  it.each(["a.png", "a", "a.md.txt"])("rejects %s", (href) => {
    expect(isMarkdownLink(href)).toBe(false);
  });
});

describe("resolvePath", () => {
  const base = "/home/zii/notes";

  it("resolves ./ relative targets", () => {
    expect(resolvePath(base, "./chapter.md")).toBe("/home/zii/notes/chapter.md");
  });
  it("resolves ../ parent targets", () => {
    expect(resolvePath(base, "../chapter.md")).toBe("/home/zii/chapter.md");
  });
  it("resolves nested relative targets", () => {
    expect(resolvePath(base, "img/pic.png")).toBe(
      "/home/zii/notes/img/pic.png"
    );
  });
  it("decodes percent-encoding", () => {
    expect(resolvePath(base, "Reading%20features.md")).toBe(
      "/home/zii/notes/Reading features.md"
    );
  });
  it("passes through absolute posix targets", () => {
    expect(resolvePath(base, "/etc/x.md")).toBe("/etc/x.md");
  });
  it("handles Windows drive base directories", () => {
    expect(resolvePath("C:/notes/sub", "../top.md")).toBe("C:/notes/top.md");
  });
  it("collapses multiple ../ segments", () => {
    expect(resolvePath(base, "../../a/b.md")).toBe("/home/a/b.md");
  });
});
