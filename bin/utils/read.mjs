import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

export default function read(filepath) {
    return readFile(filepath, 'utf8');
}
