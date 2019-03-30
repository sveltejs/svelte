import { assign } from '../internal';
import Stats from '../Stats';
import parse from '../parse/index';
import render_dom from './render-dom/index';
import render_ssr from './render-ssr/index';
import { CompileOptions, Ast, Warning } from '../interfaces';
import Component from './Component';
import fuzzymatch from '../utils/fuzzymatch';

const valid_options = [
	'format',
	'name',
	'filename',
	'generate',
	'outputFilename',
	'cssOutputFilename',
	'sveltePath',
	'dev',
	'accessors',
	'immutable',
	'hydratable',
	'legacy',
	'customElement',
	'tag',
	'css',
	'preserveComments',
	'preserveWhitespace'
];

function validate_options(options: CompileOptions, warnings: Warning[]) {
	const { name, filename } = options;

	Object.keys(options).forEach(key => {
		if (valid_options.indexOf(key) === -1) {
			const match = fuzzymatch(key, valid_options);
			let message = `Unrecognized option '${key}'`;
			if (match) message += ` (did you mean '${match}'?)`;

			throw new Error(message);
		}
	});

	if (name && !/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {
		throw new Error(`options.name must be a valid identifier (got '${name}')`);
	}

	if (name && /^[a-z]/.test(name)) {
		const message = `options.name should be capitalised`;
		warnings.push({
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

	if (parts.length > 1 && /^index\.\w+/.test(parts[parts.length - 1])) {
		parts.pop();
	}

	const base = parts.pop()
		.replace(/\..+/, "")
		.replace(/[^a-zA-Z_$0-9]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^(\d)/, '_$1');

	return base[0].toUpperCase() + base.slice(1);
}

export default function compile(source: string, options: CompileOptions = {}) {
	options = assign({ generate: 'dom', dev: false }, options);

	const stats = new Stats();
	const warnings = [];

	let ast: Ast;

	validate_options(options, warnings);

	stats.start('parse');
	ast = parse(source, options);
	stats.stop('parse');

	stats.start('create component');
	const component = new Component(
		ast,
		source,
		options.name || get_name(options.filename) || 'Component',
		options,
		stats,
		warnings
	);
	stats.stop('create component');

	const js = options.generate === false
		? null
		: options.generate === 'ssr'
			? render_ssr(component, options)
			: render_dom(component, options);

	return component.generate(js);
}