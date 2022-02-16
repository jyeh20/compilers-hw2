import assert from "assert/strict";
import derivative from "./diff.mjs";

describe("The differentiator", () => {
  it("detects malformed polynomials", () => {
    assert.throws(() => derivative("2y"));
    assert.throws(() => derivative("blah"));
    assert.throws(() => derivative("2x*6"));
    assert.throws(() => derivative("2x*-8"));
    assert.throws(() => derivative("22.3x^6.1"));
    assert.throws(() => derivative("--2x"));
    assert.throws(() => derivative("+-2x+0"));
  });
  it("correctly differentiates single-term polynomials", () => {
    assert.equal(derivative("0"), "0");
    assert.equal(derivative("4"), "0");
    assert.equal(derivative("2238"), "0");
    assert.equal(derivative("x"), "1");
    assert.equal(derivative("1x"), "1");
    assert.equal(derivative("4x"), "4");
    assert.equal(derivative("x^5"), "5x^4");
    assert.equal(derivative("2x^-4"), "-8x^-5");
    assert.equal(derivative("2.5x"), "2.5");
  });
  it("correctly differentiates multi-term polynomials", () => {
    assert.equal(derivative("-4"), "0");
    assert.equal(derivative("-2238"), "0");
    assert.equal(derivative("-x"), "-1");
    assert.equal(derivative("-x^5"), "-5x^4");
    assert.equal(derivative("-x^-5"), "5x^-6");
    assert.equal(derivative("x^3+1"), "3x^2");
    assert.equal(derivative("2x^-4    + 7x^2"), "-8x^-5+14x");
    assert.equal(derivative("   2x^-4- 7x^20"), "-8x^-5-140x^19");
    assert.equal(derivative("2x^-4       +7x^-2"), "-8x^-5-14x^-3");
    assert.equal(derivative("2.5x^-3"), "-7.5x^-4");
    assert.equal(
      derivative(" - 3x^5 - 2x + 103- 2.5x^-22"),
      "-15x^4-2+55x^-23"
    );
  });
});
