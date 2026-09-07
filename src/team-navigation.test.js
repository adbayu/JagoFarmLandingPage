import assert from "node:assert/strict";
import { adjacentTeamIndex } from "./team-navigation.js";

assert.equal(adjacentTeamIndex(0, -1, 4), 3);
assert.equal(adjacentTeamIndex(3, 1, 4), 0);
assert.equal(adjacentTeamIndex(1, 1, 4), 2);

console.log("team navigation checks passed");
