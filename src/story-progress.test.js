import assert from "node:assert/strict";
import { getStoryState } from "./story-progress.js";

assert.deepEqual(getStoryState(0, 100, 500, 100, 5), { progress: 0, stage: 0 });
assert.deepEqual(getStoryState(300, 100, 500, 100, 5), { progress: 0.5, stage: 2 });
assert.deepEqual(getStoryState(600, 100, 500, 100, 5), { progress: 1, stage: 4 });

console.log("story progress checks passed");
