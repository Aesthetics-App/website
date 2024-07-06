import { parseArgs } from 'node:util';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  cpSync,
  lstatSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import nunjucks from 'nunjucks';
import { parse } from 'yaml';


function printHelp() {
  console.error(`usage:
  builder.mjs --values VALUES [--output OUTPUT] translate PATH
  builder.mjs site PATH OUTPUT_PATH

Modules:
  translate       The translate sub command.

Arguments:
  PATH            The path to the input html template.
  OUTPUT_PATH     The output path where site will be built.

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


function makePublicSite([ path, outPath ]) {
  if (!path || !outPath) {
    printHelp();
    return 2;
  } else {
    // Create an empty output directory
    if (existsSync(outPath)) {
      rmSync(outPath, { recursive: true });
    }
    mkdirSync(dirname(outPath), {  recursive: true });

    // Copy en locale to / the
    cpSync(join(path, 'en'), outPath, { recursive: true, filter: (src, _) => !src.endsWith('index.csr.html') });

    // Copy fr and es to / in sub directory
    for (const locale of ['fr', 'es']) {
      cpSync(
        join(path, locale),
        join(outPath, locale),
        {
          recursive: true,
          filter: (src, _) => {
            return lstatSync(src).isDirectory()
              || src.endsWith('.js')
              || src.endsWith('.css')
              || src.endsWith('index.html');
          },
        },
      );
    }
  }

  return 0;
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
    process.exit(0);
  } else if (!positionals.length) {
    throw Error("MODULE is required : translate");
  } else {
    switch (positionals[0]) {
      case 'translate':
        action = () => translate(positionals.slice(1), values);
        break;
      case 'site':
        action = () => makePublicSite(positionals.slice(1));
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
