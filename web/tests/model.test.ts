import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { predict } from "../lib/model.ts";

const dir = path.join(import.meta.dirname, "..", "model");
const expr = (s: string) => predict(s, dir).expression;

test("joyful text -> happy or love", () => {
  assert.ok(["happy", "love"].includes(expr("This is amazing, I am so happy!")));
});
test("thanks -> love group (gratitude)", () => assert.equal(expr("Thank you so much, I really appreciate it"), "love"));
test("anger -> angry", () => assert.equal(expr("I hate this, it makes me so angry"), "angry"));
test("sad -> sad", () => assert.equal(expr("I miss him so much, I am heartbroken"), "sad"));
test("empty text -> neutral/relaxed", () => assert.equal(expr("   "), "relaxed"));
test("scores are probabilities", () => {
  const p = predict("what is going on?", dir);
  assert.ok(p.score > 0 && p.score <= 1 && p.top.length === 3);
});
