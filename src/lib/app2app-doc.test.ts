import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DOC_REVISION } from "../app/developers/app2app/revision.ts";

test("la página y el Markdown de App2App tienen la misma revisión", () => {
  const md = readFileSync("public/developers/app2app.md", "utf8");
  assert.match(md, new RegExp(`^> Revisión ${DOC_REVISION.replace(/\./g, "\\.")}\\.`, "m"));
});
