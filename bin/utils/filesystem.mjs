import fs from 'fs';
import util from 'util';
import mkdir from 'mkdirp';

const read = util.promisify(fs.readFile);
export const copyFile = util.promisify(fs.copyFile);
export const writeFile = util.promisify(fs.writeFile);
export const makeDirectory = util.promisify(mkdir);

export function readFile(filepath) {
    return read(filepath, 'utf8');
}
