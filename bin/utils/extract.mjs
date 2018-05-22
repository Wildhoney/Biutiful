import R from 'ramda';

function isModule(current, next) {

    const isModule = current.value === 'from' && current.type.label === 'name';
    const isThirdParty = /^[a-z0-9@]/i.test(next.value);

    return isModule && isThirdParty;

}

export default function extract(ast) {
    
    return ast.tokens.reduce((accum, node, index) => {
        const next = ast.tokens[index + 1];
        return (next && isModule(node, next)) ? [...accum, next] : accum;
    }, []);
    
}
