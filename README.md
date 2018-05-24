# Biutiful

> Biutiful transform ES imports into browser usable ECMAScript imports.

## Getting Started

Using the command requires supplying the `input` directory which contains your source files in their original format, followed by the `output` (defaults to `./`) directory which is where all of the files and ES modules will reside.

For example, to take the files from `./src` and to write to `./public` you'd supply the following:

```bash
biutiful --input ./src --output ./public
```

All of the dependencies found within `node_modules` will be placed into the `es_modules` directory, and have their imports updated &ndash; along with the source files &ndash; to map to the ES files using [Babel's AST](https://github.com/babel/babel/tree/master/packages/babel-parser) parser.

When traversing dependencies, Biutiful will attempt to find ES modules from the `package.json` file using the `module` and `js:next` entries respectively. If neither are found then either the `main` entry or `./index.js` file will be used and the file(s) transpiled using [Lebab](https://github.com/lebab/lebab).
