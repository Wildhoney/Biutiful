import fs from 'fs';
import path from 'path';
import util from 'util';
import mkdir from 'mkdirp';

const read = util.promisify(fs.readFile);
const copy = util.promisify(fs.copyFile);
export const writeFile = util.promisify(fs.writeFile);
export const makeDirectory = util.promisify(mkdir);
export const fileExists = fs.existsSync;

export function readFile(filepath) {
    return read(filepath, 'utf8');
}

export async function copyFile(input, output) {
    await makeDirectory(path.parse(output).dir);
    await copy(input, output);
}
