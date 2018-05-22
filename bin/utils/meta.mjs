import npm from 'get-installed-path';
import R from 'ramda';
import readFile from './read';

const options = {
    local: true
};

function createModel(meta) {
    const model = { ...meta, main: meta.main || null, module: meta.module || meta['js:next'] || null };
    const omitProps = R.omit('js:next');
    return omitProps(model);
}

const getMeta = R.composeP(
    createModel,
    R.pick(['version', 'main', 'module', 'js:next']),
    JSON.parse,
    readFile
);

export default async function meta(ast) {

    return Promise.all(ast.map(async node => {
        const path = await npm.getInstalledPath(node.source.value, options);
        return getMeta(`${path}/package.json`);
    }));

}
