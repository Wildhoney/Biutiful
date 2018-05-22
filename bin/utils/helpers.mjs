import fs from 'fs';
import assert from 'assert';
import PrettyError from 'pretty-error';

const pe = new PrettyError();

export function handleErrors(error) {
    const renderedError = pe.render(new Error(error));
    console.log(renderedError);
}

export function runAssertions({ input, output }) {
    assert(fs.lstatSync(input).isFile(), 'Input must be a file.');
    assert(fs.lstatSync(output).isDirectory(), 'Output must be a directory.');
}
