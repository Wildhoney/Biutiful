import npm from 'get-installed-path';
import R from 'ramda';
import readFile from './read';

const options = {
    local: true
};

const getVersion = R.composeP(R.prop('version'), JSON.parse, readFile);

export default async function(ast) {

    return Promise.all(ast.map(async node => {
        const path = await npm.getInstalledPath(node.value, options);
        return getVersion(`${path}/package.json`);
    }));

}
