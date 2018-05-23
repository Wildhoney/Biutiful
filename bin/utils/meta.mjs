import path from 'path';
import npm from 'get-installed-path';
import pkgDir from 'pkg-dir';
import R from 'ramda';
import { readFile } from './filesystem.mjs';
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

export default async function meta(ast) {

    const options = {
        local: true,
        cwd: await pkgDir()
    };

    return Promise.all(ast.map(async node => {

        try {

            // Attempt to find the installed path of the given dependency in the closest
            // `node_modules` directory.
            const modulePath = await npm.getInstalledPath(node.source.value, options);
            return getMeta(modulePath);

        } catch (err) {
            
            // An error occurred in finding the dependency.
            handleErrors(err);

        }

    }));

}
