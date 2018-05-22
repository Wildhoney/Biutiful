#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import R from 'ramda';
import runAssertions from './utils/assertions.mjs';
import handleErrors from './utils/errors.mjs';
import readFile from './utils/read.mjs';
import parseFile from './utils/parse.mjs';
import extractImports from './utils/extract.mjs';
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

    const modules = await getImports(input);
    const meta = await getMeta(modules);

    console.log(meta);

    // modules.forEach

}

main();
