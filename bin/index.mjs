#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import R from 'ramda';
import glob from 'glob';
import { runAssertions, handleErrors, getFilename } from './utils/helpers.mjs';
import { readFile, copyFile, makeDirectory } from './utils/filesystem.mjs';
import { extractImports, parseFile, updateImport, updateFile } from './utils/ast.mjs';
import parseMeta from './utils/meta.mjs';
import options from './options.mjs';

const getTree = R.composeP(parseFile, readFile);

async function main() {

    const { argv } = yargs;

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

            (async function transform(input, output) {

                const ast = await getTree(input);
                const imports = extractImports(ast);
                const meta = await parseMeta(imports);

                await Promise.all(meta.map(async ({ name, version, es, main }, index) => {
    
                    // Copy all of the contents of the module into the `es_modules` directory.
                    const input = es || main;
                    const model = { name, version, filepath: input };
                    const output = path.join(argv.output, options.dirname, getFilename(model));

                    await copyFile(input, output);

                    // Update the AST for the current file to point to the previously copied file.
                    await updateImport(output, ast, imports[index]);

                    // Recursively walk through the imports, updating their ASTs as we go.
                    return transform(input, output);
    
                }));
    
                // Update the current file with the updated AST.
                return await updateFile(output, ast);
    
            })(input, `./${path.join(argv.output, input.replace(argv.input, ''))}`);

        });
    });

}

main();
