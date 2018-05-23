#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import yargonaut from 'yargonaut';
import R from 'ramda';
import glob from 'glob';
import { runAssertions, handleErrors, getFilename } from './utils/helpers.mjs';
import { readFile, copyFile, makeDirectory } from './utils/filesystem.mjs';
import { extractImports, parseFile, updateImport, updateFile } from './utils/ast.mjs';
import parseMeta from './utils/meta.mjs';
import options from './options.mjs';

const getTree = R.composeP(parseFile, readFile);
const defaultSettings = { thirdPartyOnly: true };

yargonaut.style('green');

async function main() {

    const { argv } = yargs
        .usage('Usage: $0 --input [string] --output [string]')
        .command('count', 'Transform imports into browser usable ECMAScript modules.')
        .default('output', './')
        .string('input')
        .string('output')
        .alias('o', 'output')
        .alias('i', 'input')
        .describe('i', 'Input directory')
        .describe('o', 'Output directory')
        .demandOption(['input', 'output']);

    try {

        // Run all of the sanity checks for the passed arguments.
        runAssertions(argv);

        // Attempt to create the `es_modules` directory.
        await makeDirectory(`${argv.output}/${options.dirname}`);

    } catch (err) {

        // Handle the errors gracefully with a prettier output.
        return void handleErrors(err);

    }

    glob(`${argv.input}/${options.glob}`, {}, (_, files) => {

        return files.map(input => {

            (async function transform(input, output, moduleName, settings) {

                const ast = await getTree(input);
                const imports = extractImports(ast, settings.thirdPartyOnly);
                const meta = await parseMeta(imports, input, output, moduleName);

                await Promise.all(meta.map(async ({ name, version, es, main }, index) => {
    
                    // Copy all of the contents of the module into the `es_modules` directory.
                    const input = es || main;
                    const model = { name, version, filepath: input };

                    // Configure the output based on whether we have a version or not, which denotes
                    // whether it's a module, or a file belonging to a module.
                    const outputDirectory = version
                        ? [argv.output, options.dirname]
                        : [argv.output, options.dirname, path.parse(moduleName).name];
                    const output = path.join(...outputDirectory, getFilename(model));

                    await copyFile(input, output);

                    // Update the AST for the current file to point to the previously copied file.
                    await updateImport(output, ast, imports[index]);

                    // Recursively walk through the imports, updating their ASTs as we go.
                    return transform(input, output, getFilename(model) || moduleName, { ...settings, thirdPartyOnly: false });
    
                }));
    
                // Update the current file with the updated AST.
                return await updateFile(output, ast);
    
            })(input, `./${path.join(argv.output, input.replace(argv.input, ''))}`, null, defaultSettings);

        });
    });

}

main();
