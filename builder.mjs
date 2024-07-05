import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'fs';

import nunjucks from 'nunjucks';
import { parse } from 'yaml';


function printHelp() {
  console.error(`usage:
  builder.mjs --values VALUES [--output OUTPUT] translate PATH

Modules:
  translate       The translate sub command.

Arguments:
  PATH            The path to the input html template.

Options:
  --values, -v VALUES
                  The path to the YAML context file.
  --output, -o OUTPUT
                  The output path of generated file.
`);
}


function translate([ path ], options) {
  if (!path || !options.values) {
    printHelp();
    return 2;
  } else {
    const content = readFileSync(options.values, { encoding: 'utf-8' });
    const context = parse(content);

    nunjucks.configure('.')
    const output = nunjucks.renderString(
      readFileSync(path, { encoding: 'utf-8' }),
      context,
    );

    writeFileSync(options.output || path, output, { encoding: 'utf-8' });
  }
}


const argv = process.argv.slice(2); // skip node and script name

let action;
try {
  const { values, positionals } = parseArgs(
    {
      options: {
        help: {
          type: 'boolean',
          short: 'h',
          default: false,
        },
        values: {
          type: 'string',
          short: 'v',
        },
        output: {
          type: 'string',
          short: 'o',
        },
      },
      allowPositionals: true,
    },
    argv,
  );

  if (values.help) {
    printHelp();
  } else if (!positionals.length) {
    throw Error("MODULE is required : translate");
  } else {
    switch (positionals[0]) {
      case 'translate':
        action = () => translate(positionals.slice(1), values);
        break;
      default:
        throw Error('Unknown module', positionals[0]);
    }
  }
} catch (err) {
  console.error(err.message);
  printHelp();
  process.exit(1);
}


process.exit(
  action(),
);
