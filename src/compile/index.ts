import { assign } from '../shared';
import Stats from '../Stats';
import parse from '../parse/index';
import renderDOM from './render-dom/index';
import renderSSR from './render-ssr/index';
import { CompileOptions, Warning, Ast } from '../interfaces';
import Component from './Component';
import deprecate from '../utils/deprecate';

function normalize_options(options: CompileOptions): CompileOptions {
	let normalized = assign({ generate: 'dom', dev: false }, options);
	const { onwarn } = normalized;

	normalized.onwarn = onwarn
		? (warning: Warning) => onwarn(warning, default_onwarn)
		: default_onwarn;

	return normalized;
}

function default_onwarn({ start, message }: Warning) {
	if (start) {
		console.warn(`(${start.line}:${start.column}) – ${message}`);
	} else {
		console.warn(message);
	}
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

export default function compile(source: string, options: CompileOptions = {}) {
	const onerror = options.onerror || (err => {
		throw err;
	});

	if (options.onerror) {
		// TODO remove in v3
		deprecate(`Instead of using options.onerror, wrap svelte.compile in a try-catch block`);
		delete options.onerror;
	}

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
			stats
		);
		stats.stop('create component');

		if (options.generate === false) {
			return { ast, stats: stats.render(null), js: null, css: null };
		}

		if (options.generate === 'ssr') {
			return renderSSR(component, options);
		}

		return renderDOM(component, options);
	} catch (err) {
		onerror(err);
	}
}