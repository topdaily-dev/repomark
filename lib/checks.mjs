import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {import("./score.mjs").CheckResult} CheckResult
 */

/**
 * @param {string} dir
 * @returns {string | null}
 */
function findReadme(dir) {
  for (const name of ["README.md", "Readme.md", "readme.md"]) {
    const p = path.join(dir, name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

/**
 * @param {string} dir
 * @param {string[]} names
 * @returns {string | null}
 */
function findFile(dir, names) {
  for (const name of names) {
    const p = path.join(dir, name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

/**
 * @param {string} dir
 * @returns {CheckResult[]}
 */
export function runChecks(dir) {
  const root = path.resolve(dir);
  /** @type {CheckResult[]} */
  const checks = [];

  const readmePath = findReadme(root);
  if (!readmePath) {
    checks.push({
      id: "readme",
      title: "README",
      status: "fail",
      message: "No README.md found",
      weight: 20,
      fix: "Add a README.md with a title and short project description",
    });
  } else {
    const readme = fs.readFileSync(readmePath, "utf8");
    const hasTitle = /^#\s+\S+/m.test(readme);
    const prose = readme
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\s*#.*$/gm, "")
      .replace(/^\s*\[!\[.*?\]\(.*?\)\]\(.*?\)/gm, "")
      .replace(/^\s*!\[.*?\]\(.*?\)/gm, "")
      .trim();
    const hasDescription = prose.length >= 40;

    if (hasTitle && hasDescription) {
      checks.push({
        id: "readme",
        title: "README",
        status: "pass",
        message: "Title and description present",
        weight: 20,
      });
    } else if (hasTitle) {
      checks.push({
        id: "readme",
        title: "README",
        status: "warn",
        message: "Has a title but description looks thin",
        weight: 20,
        fix: "Add a short paragraph under the title explaining what the project does",
      });
    } else {
      checks.push({
        id: "readme",
        title: "README",
        status: "fail",
        message: "README exists but is missing a top-level # title",
        weight: 20,
        fix: "Start README.md with `# Project Name`",
      });
    }

    const hasBadges =
      /img\.shields\.io|shields\.io|badge\.svg|github\.com\/[^/\s]+\/[^/\s]+\/actions/.test(
        readme,
      );
    checks.push({
      id: "badges",
      title: "Badges",
      status: hasBadges ? "pass" : "warn",
      message: hasBadges
        ? "Badge / shields links found"
        : "No shields.io or CI badge links found",
      weight: 10,
      fix: hasBadges
        ? undefined
        : "npx @topdaily-dev/badgekit row ci npm license --owner OWNER --repo REPO --npm PACKAGE",
    });

    const hasContributingSection =
      /##+\s*Contribut/i.test(readme) ||
      Boolean(findFile(root, ["CONTRIBUTING.md", "CONTRIBUTING"]));
    checks.push({
      id: "contributing",
      title: "Contributing",
      status: hasContributingSection ? "pass" : "warn",
      message: hasContributingSection
        ? "Contributing guide or section found"
        : "No CONTRIBUTING.md or Contributing section",
      weight: 10,
      fix: hasContributingSection
        ? undefined
        : "Add CONTRIBUTING.md or a ## Contributing section in README",
    });

    const hasSecurity =
      Boolean(findFile(root, ["SECURITY.md", "SECURITY"])) ||
      /security@|##+\s*Security/i.test(readme);
    checks.push({
      id: "security",
      title: "Security policy",
      status: hasSecurity ? "pass" : "warn",
      message: hasSecurity
        ? "Security policy found"
        : "No SECURITY.md or Security section",
      weight: 10,
      fix: hasSecurity
        ? undefined
        : "Add SECURITY.md with a vulnerability reporting contact",
    });
  }

  const licensePath = findFile(root, [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "MIT-LICENSE",
  ]);
  checks.push({
    id: "license",
    title: "License",
    status: licensePath ? "pass" : "fail",
    message: licensePath
      ? `Found ${path.basename(licensePath)}`
      : "No LICENSE file found",
    weight: 15,
    fix: licensePath ? undefined : "Add a LICENSE file (e.g. MIT)",
  });

  const pkgPath = path.join(root, "package.json");
  if (fs.existsSync(pkgPath)) {
    /** @type {Record<string, unknown>} */
    let pkg = {};
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    } catch {
      checks.push({
        id: "package-json",
        title: "package.json",
        status: "fail",
        message: "package.json is not valid JSON",
        weight: 20,
        fix: "Fix JSON syntax in package.json",
      });
    }

    if (Object.keys(pkg).length > 0) {
      const required = ["name", "description", "license", "repository"];
      const missing = required.filter((k) => !pkg[k]);
      const hasEngines = Boolean(pkg.engines);
      if (missing.length === 0 && hasEngines) {
        checks.push({
          id: "package-json",
          title: "package.json",
          status: "pass",
          message: "Core metadata fields present",
          weight: 20,
        });
      } else if (missing.length === 0) {
        checks.push({
          id: "package-json",
          title: "package.json",
          status: "warn",
          message: "Missing engines field",
          weight: 20,
          fix: 'Add "engines": { "node": ">=20" } (or your supported range)',
        });
      } else {
        checks.push({
          id: "package-json",
          title: "package.json",
          status: "fail",
          message: `Missing fields: ${missing.join(", ")}`,
          weight: 20,
          fix: `Set ${missing.join(", ")} in package.json`,
        });
      }
    }
  } else {
    checks.push({
      id: "package-json",
      title: "package.json",
      status: "warn",
      message: "No package.json (skipped Node metadata checks)",
      weight: 5,
    });
  }

  const workflowsDir = path.join(root, ".github", "workflows");
  const hasWorkflows =
    fs.existsSync(workflowsDir) &&
    fs.readdirSync(workflowsDir).some((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  checks.push({
    id: "ci",
    title: "CI workflows",
    status: hasWorkflows ? "pass" : "warn",
    message: hasWorkflows
      ? "GitHub Actions workflow found"
      : "No .github/workflows/*.yml found",
    weight: 10,
    fix: hasWorkflows
      ? undefined
      : "Add a CI workflow under .github/workflows/",
  });

  const issueTemplatesDir = path.join(root, ".github", "ISSUE_TEMPLATE");
  const hasIssueTemplates =
    (fs.existsSync(issueTemplatesDir) &&
      fs.readdirSync(issueTemplatesDir).length > 0) ||
    fs.existsSync(path.join(root, ".github", "ISSUE_TEMPLATE.md"));
  checks.push({
    id: "issue-templates",
    title: "Issue templates",
    status: hasIssueTemplates ? "pass" : "warn",
    message: hasIssueTemplates
      ? "Issue templates found"
      : "No .github/ISSUE_TEMPLATE found",
    weight: 5,
    fix: hasIssueTemplates
      ? undefined
      : "Add bug/feature issue templates under .github/ISSUE_TEMPLATE/",
  });

  checks.push({
    id: "topics",
    title: "GitHub topics",
    status: "warn",
    message:
      "Topics cannot be verified without the GitHub API — set 3–5 topics on the repo page",
    weight: 5,
    fix: "Add topics on GitHub (Settings → General → Topics), e.g. cli, open-source, developer-tools",
  });

  return checks;
}

/**
 * @param {CheckResult[]} checks
 * @returns {string[]}
 */
export function buildFixSuggestions(checks) {
  return checks
    .filter((c) => c.status !== "pass" && c.fix)
    .map((c) => c.fix);
}
