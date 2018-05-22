import fs from 'fs';
import path from 'path';
import util from 'util';

const read = util.promisify(fs.readFile);
const copy = util.promisify(fs.copyFile);

export function readFile(filepath) {
    return read(filepath, 'utf8');
}

export function copyFile(output, { version, es, main }) {
    const { name } = path.parse(main);
    const filename = `${name}@${version}.js`;
    return copy(es, path.join(output, filename));
}
