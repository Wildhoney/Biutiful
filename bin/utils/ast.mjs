import path from 'path';
import R from 'ramda';
import { handleErrors } from './helpers.mjs';
import babel from '@babel/core';
import { writeFile, makeDirectory } from './filesystem.mjs';

const isImport = R.propEq('type', 'ImportDeclaration');

const options = {
    sourceType: 'module',
    plugins: [
        '@babel/plugin-syntax-jsx', '@babel/plugin-syntax-dynamic-import'
    ]
};

export function isThirdParty({ source }) {
    return /^[a-z0-9@]/i.test(source.value);
}

export function extractImports(ast, thirdPartyOnly) {
    return ast.program.body
        .filter(isImport)
        .filter(thirdPartyOnly ? isThirdParty : R.T);
}

export function parseFile(code) {
    return babel.parse(code, options);
}

export function updateImport(filepath, ast, importExpression) {
    importExpression.source.value = `/${filepath}`;
}

export async function updateFile(filepath, ast) {

    try {

        // Attempt to create the target directory.
        const directoryPath = path.parse(filepath).dir;
        await makeDirectory(directoryPath);

    } catch (err) {

        // Unable to create the target directory.
        handleErrors(err);

    }

    return writeFile(filepath, babel.transformFromAst(ast).code);

}
