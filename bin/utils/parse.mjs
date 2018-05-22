import babel from '@babel/core';

const options = {
    sourceType: 'module'
};

export default function parse(code) {
    return babel.parse(code, options);
}
