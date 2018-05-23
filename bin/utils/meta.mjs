import path from 'path';
import npm from 'get-installed-path';
import pkgDir from 'pkg-dir';
import R from 'ramda';
import { readFile } from './filesystem.mjs';
import { isThirdParty } from './ast.mjs';
import { handleErrors } from './helpers.mjs';

const omit = R.omit(['js:next']);

function createModel(module) {

    return meta => {

        const model = omit({
            ...meta,
            module,
            filepath: path.join(module, meta.module || meta['js:next'] || null)
        });

        return model;

    };

}

const getMeta = module => R.composeP(
    createModel(module),
    R.pick(['version', 'name', 'module', 'js:next']),
    JSON.parse,
    () => readFile(`${module}/package.json`),
)();

export default async function meta(ast, input, module) {

    const options = {
        local: true,
        cwd: await pkgDir()
    };

    return Promise.all(ast.map(async node => {

        try {

            try {

                // Attempt to find the installed path of the given dependency in the closest
                // `node_modules` directory.
                const module = await npm.getInstalledPath(node.source.value, options);
                return getMeta(module);

            } catch (err) {

                if (isThirdParty(node)) {

                    // Rethrow the error as we were unable to find the module.
                    throw err;

                }

                // Resolve the output directory locally.
                const output = path.join(path.parse(module.filepath).dir, node.source.value);
                return { ...module, filepath: output };

            }

        } catch (err) {
            
            // An error occurred in finding the dependency.
            handleErrors(err);

        }

    }));

}
