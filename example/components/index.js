import * as a from 'ultradom';
import * as b from '../';

async function test() {
    const imports = await import('redux');
    console.log(imports);
}

console.log('components/index');
