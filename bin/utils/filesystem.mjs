import fs from 'fs';
import path from 'path';
import util from 'util';

const read = util.promisify(fs.readFile);
const copy = util.promisify(fs.copyFile);
export const writeFile = util.promisify(fs.writeFile);

function getFilename({ name, version }) {
    return `${name}@${version}.js`;
}

export function readFile(filepath) {
    return read(filepath, 'utf8');
}

export async function copyFile(output, { name, version, filepath }) {
    const filename = getFilename({ name, version });
    await copy(filepath, path.join(output, filename));
    return filename;
}
