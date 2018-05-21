import fs from 'fs';
import assert from 'assert';

export default function run({ input, output }) {
    assert(fs.lstatSync(input).isFile(), 'Input must be a file.');
    assert(fs.lstatSync(output).isDirectory(), 'Output must be a directory.');
}
