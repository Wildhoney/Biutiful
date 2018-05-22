import path from 'path';
import npm from 'get-installed-path';
import R from 'ramda';
import { readFile } from './filesystem.mjs';

const options = {
    local: true
};

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

    return Promise.all(ast.map(async node => {
        const modulePath = await npm.getInstalledPath(node.source.value, options);
        return getMeta(modulePath);
    }));

}
