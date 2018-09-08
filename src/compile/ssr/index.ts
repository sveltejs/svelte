import generate from '@sveltejs/generate-ssr';
import Compiler from '../Compiler';
import Stats from '../../Stats';
import Stylesheet from '../../css/Stylesheet';
import { Ast, CompileOptions } from '../../interfaces';

export default function ssr(
	ast: Ast,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions,
	stats: Stats
) {
	const compiler = new Compiler(ast, source, options.name || 'SvelteComponent', stylesheet, options, stats, false);

	return generate(compiler);
}