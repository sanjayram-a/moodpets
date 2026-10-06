import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { predict } from "../lib/model.ts";
import { EXAMPLES } from "../lib/examples.ts";

const dir = path.join(import.meta.dirname, "..", "model");

// sentence -> pet mood it should trigger
const EXPECTED: Record<string, string> = {
  "I just got the job, I can't stop smiling!": "happy",
  "Thank you so much, you made my whole week.": "love",
  "I love you more than words can say.": "love",
  "Wow, I did not see that coming at all!": "surprised",
  "I miss her so much it hurts.": "sad",
  "This is the worst service I have ever had.": "angry",
  "I am so annoyed, he keeps interrupting me.": "angry",
  "I'm terrified of the exam tomorrow.": "scared",
  "Why is the sky blue? I'm curious.": "curious",
  "I don't understand what you mean.": "curious",
  "That joke was hilarious, I'm crying laughing!": "happy",
  "I'm so proud of what we built together.": "happy",
  "I'm really sorry, I should have listened.": "sad",
  "I wish I could go to the concert with you.": "puppy",
  "Finally, that's over. What a relief.": "relaxed",
  "Great idea, I totally agree with you.": "relaxed",
  "That is disgusting, I can't look at it.": "angry",
  "I'm so embarrassed, everyone saw me trip.": "scared",
  "I'm so excited for the trip tomorrow!": "happy",
  "The meeting is at three o'clock.": "relaxed",
};

test("every example has an expectation and vice versa", () => {
  assert.deepEqual([...EXAMPLES].sort(), Object.keys(EXPECTED).sort());
});

for (const text of EXAMPLES) {
  test(`example -> ${EXPECTED[text]}: ${text}`, () => {
    assert.equal(predict(text, dir).expression, EXPECTED[text]);
  });
}

test("all 9 pet moods are covered by the examples", () => {
  assert.equal(new Set(Object.values(EXPECTED)).size, 9);
});
