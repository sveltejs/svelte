import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';

const src = path.resolve( 'src' );

export default {
	entry: 'src/index.ts',
	moduleName: 'svelte',
	targets: [
		{ dest: 'compiler/svelte.js', format: 'umd' }
	],
	plugins: [
		{
			resolveId ( importee, importer ) {
				// bit of a hack — TypeScript only really works if it can resolve imports,
				// but they misguidedly chose to reject imports with file extensions. This
				// means we need to resolve them here
				if ( importer && importer.startsWith( src ) && importee[0] === '.' && path.extname( importee ) === '' ) {
					return path.resolve( path.dirname( importer ), `${importee}.ts` );
				}
			}
		},
		nodeResolve({ jsnext: true, module: true }),
		commonjs(),
		json(),
		typescript({
			include: 'src/**',
			exclude: 'src/shared/**',
			typescript: require( 'typescript' )
		})
	],
	sourceMap: true
};
