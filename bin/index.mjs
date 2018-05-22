#!/usr/bin/env node

import yargs from 'yargs';
import R from 'ramda';
import { runAssertions, handleErrors } from './utils/helpers.mjs';
import { readFile, copyFile } from './utils/filesystem.mjs';
import { extractImports, parseFile } from './utils/ast.mjs';
import getMeta from './utils/meta.mjs';

const getImports = R.composeP(extractImports, parseFile, readFile);

async function main() {

    const { input, output } = yargs.argv;

    try {

        // Run all of the sanity checks for the passed arguments.
        runAssertions(yargs.argv);

    } catch (err) {

        // Handle the errors gracefully with a prettier output.
        return void handleErrors(err);

    }

    (async function go(filepath) {

        const modules = await getImports(filepath);
        const meta = await getMeta(modules);

        meta.map(({ name, version, es, main }) => {
            const input = es || main;
            copyFile(output, { name, version, filepath: es || main });
            go(input);
        });

    })(input);

}

main();
