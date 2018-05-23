import path from 'path';
import npm from 'get-installed-path';
import pkgDir from 'pkg-dir';
import R from 'ramda';
import { readFile, makeDirectory } from './filesystem.mjs';
import { isThirdParty } from './ast.mjs';
import { handleErrors } from './helpers.mjs';

const omit = R.omit(['module', 'js:next']);

function createModel(modulePath) {

    return meta => {

        const model = omit({
            ...meta,
            es: path.join(modulePath, meta.module || meta['js:next'] || null),
            main: path.join(modulePath, meta.main || null)
        });

        return model;

    };

}

const getMeta = modulePath => R.composeP(
    createModel(modulePath),
    R.pick(['version', 'name', 'main', 'module', 'js:next']),
    JSON.parse,
    () => readFile(`${modulePath}/package.json`),
)();

export default async function meta(ast, input, output, moduleName) {

    const options = {
        local: true,
        cwd: await pkgDir()
    };

    return Promise.all(ast.map(async node => {

        try {

            try {

                // Attempt to find the installed path of the given dependency in the closest
                // `node_modules` directory.
                const modulePath = await npm.getInstalledPath(node.source.value, options);
                return getMeta(modulePath);

            } catch (err) {

                if (isThirdParty(node)) {

                    // Rethrow the error as we were unable to find the module.
                    throw err;

                }

                // Create the sub-directory for holding a module's files.
                const subDirectoryPath = path.join(path.parse(output).dir, path.parse(moduleName).name);
                await makeDirectory(subDirectoryPath);

                // Attemmpt to find the directory relative from the input.
                const { dir } = path.parse(input);
                const file = path.join(dir, node.source.value);
                const { name } = path.parse(node.source.value);

                return { name, es: file, version: null };

            }

        } catch (err) {
            
            // An error occurred in finding the dependency.
            handleErrors(err);

        }

    }));

}
