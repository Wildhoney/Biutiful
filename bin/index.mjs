#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import R from 'ramda';
import { runAssertions, handleErrors } from './utils/helpers.mjs';
import { readFile, copyFile } from './utils/filesystem.mjs';
import { extractImports, parseFile, updateImport, updateFile } from './utils/ast.mjs';
import parseMeta from './utils/meta.mjs';

const getTree = R.composeP(parseFile, readFile);

async function main() {

    const { input, output } = yargs.argv;

    try {

        // Run all of the sanity checks for the passed arguments.
        runAssertions(yargs.argv);

    } catch (err) {

        // Handle the errors gracefully with a prettier output.
        return void handleErrors(err);

    }

    (async function transform(input, output) {

        const ast = await getTree(input);
        const imports = extractImports(ast);
        const meta = await parseMeta(imports);

        await Promise.all(meta.map(async ({ name, version, es, main }, index) => {

            // Copy all of the contents of the module into the `es_modules` directory.
            const model = { name, version, filepath: es || main };  
            const input = path.join(output, await copyFile(output, model));

            // Update the AST for the current file to point to the previously copied file.
            await updateImport(input, ast, imports[index]);

            // // Recursively walk through the imports, updating their ASTs as we go.
            return transform(input, output);

        }));

        // Update the current file with the updated AST.
        return updateFile(input, ast);

    })(input, output);

}

main();
