import { describe, it, expect } from "vitest";
import { en } from "./en";
import { dictionaries, locales } from "./index";

describe("i18n", () => {
  const enKeys = Object.keys(en).sort();

  it("registers a dictionary for every advertised locale", () => {
    expect(Object.keys(dictionaries).sort()).toEqual(
      locales.map((l) => l.code).sort()
    );
  });

  for (const { code } of locales) {
    it(`locale "${code}" defines exactly the English keys`, () => {
      expect(Object.keys(dictionaries[code]).sort()).toEqual(enKeys);
    });

    it(`locale "${code}" has no empty translations`, () => {
      for (const [key, value] of Object.entries(dictionaries[code])) {
        expect(value, `${code}: ${key}`).toBeTruthy();
      }
    });
  }
});
