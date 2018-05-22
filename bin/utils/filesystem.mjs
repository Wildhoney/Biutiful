import fs from 'fs';
import path from 'path';
import util from 'util';

const read = util.promisify(fs.readFile);
const copy = util.promisify(fs.copyFile);

export function readFile(filepath) {
    return read(filepath, 'utf8');
}

export function copyFile(output, { name, version, filepath }) {
    const filename = `${name}@${version}.js`;
    return copy(filepath, path.join(output, filename));
}
