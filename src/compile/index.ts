import { assign } from '../internal';
import Stats from '../Stats';
import parse from '../parse/index';
import renderDOM from './render-dom/index';
import renderSSR from './render-ssr/index';
import { CompileOptions, Warning, Ast } from '../interfaces';
import Component from './Component';

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

function get_name(filename) {
	if (!filename) return null;
	const parts = filename.split(/[\/\\]/);
	if (/index\.\w+/.test(parts)) parts.pop();

	const base = parts.pop().replace(/\..+/, "");
	return base[0].toUpperCase() + base.slice(1);
}

export default function compile(source: string, options: CompileOptions = {}) {
	options = assign({ generate: 'dom', dev: false }, options);

	const stats = new Stats({
		onwarn: options.onwarn
			? (warning: Warning) => options.onwarn(warning, default_onwarn)
			: default_onwarn
	});

	let ast: Ast;

	validate_options(options, stats);

	stats.start('parse');
	ast = parse(source, options);
	stats.stop('parse');

	stats.start('create component');
	const component = new Component(
		ast,
		source,
		options.name || get_name(options.filename) || 'SvelteComponent',
		options,
		stats
	);
	stats.stop('create component');

	if (options.generate === false) {
		return { ast, stats: stats.render(component), js: null, css: null };
	}

	const js = options.generate === 'ssr'
		? renderSSR(component, options)
		: renderDOM(component, options);

	return component.generate(js);
}