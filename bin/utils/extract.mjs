export default function extract(ast) {
    
    return ast.tokens.reduce((accum, node, index) => {
        const next = ast.tokens[index + 1];
        const isModule = node.value === 'from' && node.type.label === 'name' && next;
        return isModule ? [...accum, next] : accum;
    }, []);
    
}
