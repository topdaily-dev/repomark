#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

/** @type {readonly RegExp[]} */
export const FORBIDDEN_ATTRIBUTION_PATTERNS = [
  /Co-authored-by:.*cursoragent/i,
  /Co-authored-by:.*Cursor\s*</i,
  /Co-authored-by:.*@cursor\.com/i,
  /^Made-with:.*Cursor/im,
  /^Signed-off-by:.*cursoragent/im,
];

/**
 * @param {string} message
 * @returns {string}
 */
export function stripForbiddenAttribution(message) {
  const lines = message.split("\n");
  const kept = lines.filter(
    (line) => !FORBIDDEN_ATTRIBUTION_PATTERNS.some((pattern) => pattern.test(line)),
  );

  while (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }

  return kept.join("\n");
}

/**
 * @param {string} message
 * @returns {string[]}
 */
export function findForbiddenAttribution(message) {
  return message
    .split("\n")
    .filter((line) => FORBIDDEN_ATTRIBUTION_PATTERNS.some((pattern) => pattern.test(line)));
}

/**
 * @param {string} filePath
 * @returns {{ stripped: boolean; removed: string[] }}
 */
export function stripFileInPlace(filePath) {
  const original = readFileSync(filePath, "utf8");
  const removed = findForbiddenAttribution(original);
  const cleaned = stripForbiddenAttribution(original);

  if (cleaned !== original) {
    writeFileSync(filePath, cleaned.endsWith("\n") ? cleaned : `${cleaned}\n`, "utf8");
  }

  return { stripped: removed.length > 0, removed };
}

function isMainModule() {
  const invoked = process.argv[1];
  if (!invoked) {
    return false;
  }
  return import.meta.url.endsWith(invoked.replace(/\\/g, "/"));
}

if (isMainModule()) {
  const args = process.argv.slice(2);
  const checkMode = args[0] === "--check";
  const filePath = checkMode ? args[1] : args[0];

  if (!filePath) {
    console.error("Usage: strip-cursor-trailers.mjs <commit-msg-file>");
    console.error("       strip-cursor-trailers.mjs --check <commit-msg-file>");
    process.exit(1);
  }

  if (checkMode) {
    const message = readFileSync(filePath, "utf8");
    const forbidden = findForbiddenAttribution(message);
    if (forbidden.length > 0) {
      console.error("Commit message contains forbidden Cursor attribution:");
      for (const line of forbidden) {
        console.error(`  ${line.trim()}`);
      }
      console.error("");
      console.error("Use only human GitHub co-authors (kory-kaai, topdaily-dev).");
      console.error("See docs/git-attribution.md");
      process.exit(1);
    }
    process.exit(0);
  }

  const { stripped, removed } = stripFileInPlace(filePath);
  if (stripped) {
    for (const line of removed) {
      console.error(`Stripped forbidden attribution: ${line.trim()}`);
    }
  }
}
