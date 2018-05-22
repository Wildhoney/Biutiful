import R from 'ramda';
import babel from '@babel/core';
import { writeFile } from './filesystem.mjs';

const isImport = R.propEq('type', 'ImportDeclaration');

function isThirdParty({ source }) {
    return /^[a-z0-9@]/i.test(source.value);
}

export function extractImports(ast) {
    return ast.program.body.filter(isImport).filter(isThirdParty);
}

export function parseFile(code) {
    return babel.parse(code);
}

export function updateImport(filepath, ast, importExpression) {
    importExpression.source.value = `/${filepath}`;
}

export function updateFile(filepath, ast) {
    return writeFile(filepath, babel.transformFromAst(ast).code);
}
