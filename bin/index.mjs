#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import lebab from 'lebab';
import yargonaut from 'yargonaut';
import R from 'ramda';
import glob from 'glob';
import { runAssertions, handleErrors, directory, assertExists } from './utils/helpers.mjs';
import { readFile, copyFile, writeFile } from './utils/filesystem.mjs';
import { extractImports, parseFile, updateImport, updateFile, isThirdParty } from './utils/ast.mjs';
import parseMeta from './utils/meta.mjs';
import options from './options.mjs';

const getTree = R.composeP(parseFile, readFile);
const defaultSettings = { thirdPartyOnly: true };

yargonaut.style('green');

async function main() {

    const { argv } = yargs
        .usage('Usage: $0 --input [string] --output [string]')
        .command('count', 'Biutiful transform ES imports into browser usable ECMAScript imports.')
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

    } catch (err) {

        // Handle the errors gracefully with a prettier output.
        return void handleErrors(err);

    }

    glob(`${argv.input}/${options.glob}`, {}, (_, files) => {

        return files.map(async file => {

            // Determine the output for the ES file, and copy the file from the input directory.
            const output = path.join(argv.output, path.normalize(file).replace(path.normalize(argv.input), ''));
            await copyFile(file, output);

            (async function transform(input, module, settings) {

                const ast = await getTree(input);
                const imports = extractImports(ast, settings.thirdPartyOnly);
                const meta = await parseMeta(imports, input, module);

                await Promise.all(meta.filter(assertExists).map(async (model, index) => {

                    // Determine whether the current import is a module, or a local import relative to
                    // the current module.
                    const isLocalImport = !isThirdParty(imports[index]);
                    const input = model.filepath;
                    const output = path.join(
                        argv.output,
                        options.dirname,
                        model.version ? directory(model) : module,
                        path.normalize(model.filepath).replace(path.normalize(model.module), '')
                    );

                    // Copy the file and update the AST for the current file to point to the previously
                    // copied file.
                    await copyFile(input, output);

                    if (model.requiresTransform) {

                        // Transform the copied file using Lebab if it's detected to be a non-ES module.
                        const code = await readFile(output);
                        await writeFile(output, lebab.transform(code, options.config.lebab).code);

                    }

                    // Update the imports in the AST for the copied file.
                    await updateImport(output, ast, imports[index], argv.output);

                    // Recursively walk through the imports, updating their ASTs as we go.
                    return transform(
                        output,
                        isLocalImport ? { ...module, filepath: path.resolve(output) } : model,
                        { ...settings, thirdPartyOnly: false }
                    );
    
                }));
    
                // Update the current file with the updated AST.
                return await updateFile(input, ast);
    
            })(output, null, defaultSettings);

        });
    });

}

main();
