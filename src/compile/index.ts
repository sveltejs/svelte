import { assign } from '../shared';
import Stats from '../Stats';
import parse from '../parse/index';
import Stylesheet from '../css/Stylesheet';
import validate from '../validate';
import generate from './dom/index';
import generateSSR from './ssr/index';
import { CompileOptions, Warning, Ast } from '../interfaces';

function normalize_options(options: CompileOptions): CompileOptions {
	let normalized = assign({ generate: 'dom' }, options);
	const { onwarn, onerror } = normalized;

	normalized.onwarn = onwarn
		? (warning: Warning) => onwarn(warning, default_onwarn)
		: default_onwarn;

	normalized.onerror = onerror
		? (error: Error) => onerror(error, default_onerror)
		: default_onerror;

	return normalized;
}

function default_onwarn({ start, message }: Warning) {
	if (start) {
		console.warn(`(${start.line}:${start.column}) – ${message}`);
	} else {
		console.warn(message);
	}
}

function default_onerror(error: Error) {
	throw error;
}

export default function compile(source: string, _options: CompileOptions) {
	const options = normalize_options(_options);
	let ast: Ast;

	const stats = new Stats({
		onwarn: options.onwarn
	});

	try {
		stats.start('parse');
		ast = parse(source, options);
		stats.stop('parse');
	} catch (err) {
		options.onerror(err);
		return;
	}

	stats.start('stylesheet');
	const stylesheet = new Stylesheet(source, ast, options.filename, options.dev);
	stats.stop('stylesheet');

	stats.start('validate');
	validate(ast, source, stylesheet, stats, options);
	stats.stop('validate');

	if (options.generate === false) {
		return { ast, stats: stats.render(null), js: null, css: null };
	}

	const compiler = options.generate === 'ssr' ? generateSSR : generate;

	return compiler(ast, source, stylesheet, options, stats);
}