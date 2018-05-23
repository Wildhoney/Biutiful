export default {
    dirname: 'es_modules',
    glob: '{*,*/**}.{js,jsx,mjs}',
    config: {
        babel: {
            sourceType: 'module',
            plugins: [
                '@babel/plugin-syntax-jsx', '@babel/plugin-syntax-dynamic-import'
            ]
        },
        lebab: ['let', 'arrow'],
    }
};
