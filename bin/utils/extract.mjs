import R from 'ramda';

const isImport = R.propEq('type', 'ImportDeclaration');

function isThirdParty({ source }) {
    return /^[a-z0-9@]/i.test(source.value);
}

export default function extract(ast) {
    return ast.program.body.filter(isImport).filter(isThirdParty);
}
