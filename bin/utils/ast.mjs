import path from 'path';
import R from 'ramda';
import { handleErrors } from './helpers.mjs';
import babel from '@babel/core';
import { writeFile, makeDirectory } from './filesystem.mjs';
import options from '../options.mjs';

const isImport = R.propEq('type', 'ImportDeclaration');

export function isThirdParty({ source }) {
    return /^[a-z0-9@]/i.test(source.value);
}

export function extractImports(ast, thirdPartyOnly) {
    return ast.program.body
        .filter(isImport)
        .filter(thirdPartyOnly ? isThirdParty : R.T);
}

export function parseFile(code) {
    return babel.parse(code, options.config.babel);
}

export function updateImport(filepath, ast, importExpression, output) {
    importExpression.source.value = path.normalize(`/${path.normalize(filepath).replace(path.normalize(output), '')}`);
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
