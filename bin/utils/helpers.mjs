import fs from 'fs';
import assert from 'assert';
import glob from 'glob';
import PrettyError from 'pretty-error';
import options from '../options.mjs';
import { fileExists } from './filesystem.mjs';

const pe = new PrettyError();

export function handleErrors(error) {
    const renderedError = pe.render(new Error(error));
    console.log(renderedError);
}

export function runAssertions({ input, output }) {

    assert(fs.lstatSync(input).isDirectory(), 'Input must be a directory.');
    assert(glob.sync(`${input}/${options.glob}`).length > 0, 'Input directory contains no matched files.');
    assert(fs.lstatSync(output).isDirectory(), 'Output must be a directory.');
}

export function directory({ name, version }) {
    return version ? `${name}@${version}` : `${name}`;
}

export function assertExists({ name, version, filepath }) {

    return fileExists(filepath) ? true : (() => {
        handleErrors(`Cannot find ${filepath} for ${name}@${version} module.`);
        false;
    })();

}
