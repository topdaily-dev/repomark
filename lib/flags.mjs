/**
 * @param {string[]} argv
 * @returns {{ options: Record<string, string | boolean>, positional: string[] }}
 */
export function parseFlags(argv) {
  /** @type {Record<string, string | boolean>} */
  const options = {};
  /** @type {string[]} */
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        options[key] = true;
      } else {
        options[key] = next;
        i++;
      }
      continue;
    }
    positional.push(arg);
  }

  return { options, positional };
}
