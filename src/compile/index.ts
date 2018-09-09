import { assign } from '../shared';
import Stats from '../Stats';
import parse from '../parse/index';
import generate, { DomTarget } from './dom/index';
import generateSSR, { SsrTarget } from './ssr/index';
import { CompileOptions, Warning, Ast } from '../interfaces';
import Component from './Component';

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

function validate_options(options: CompileOptions, stats: Stats) {
	const { name, filename } = options;

	if (name && !/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {
		const error = new Error(`options.name must be a valid identifier (got '${name}')`);
		throw error;
	}

	if (name && /^[a-z]/.test(name)) {
		const message = `options.name should be capitalised`;
		stats.warn({
			code: `options-lowercase-name`,
			message,
			filename,
			toString: () => message,
		});
	}
}

export default function compile(source: string, options: CompileOptions) {
	options = normalize_options(options);

	const stats = new Stats({
		onwarn: options.onwarn
	});

	let ast: Ast;

	try {
		validate_options(options, stats);

		stats.start('parse');
		ast = parse(source, options);
		stats.stop('parse');

		stats.start('create component');
		const component = new Component(
			ast,
			source,
			options.name || 'SvelteComponent',
			options,
			stats,

			// TODO make component generator-agnostic, to allow e.g. WebGL generator
			options.generate === 'ssr' ? new SsrTarget() : new DomTarget()
		);
		stats.stop('create component');

		if (options.generate === false) {
			return { ast, stats: stats.render(null), js: null, css: null };
		}

		const compiler = options.generate === 'ssr' ? generateSSR : generate;

		return compiler(component, options);
	} catch (err) {
		options.onerror(err);
		return;
	}
}