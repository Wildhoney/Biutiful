export default {
    dirname: 'es_modules',
    glob: '{*,**/*}.{js,jsx,mjs}',
    config: {
        babel: {
            sourceType: 'module',
            plugins: [
                '@babel/plugin-syntax-jsx', '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-syntax-object-rest-spread'
            ]
        },
        lebab: ['let', 'arrow'],
    }
};
