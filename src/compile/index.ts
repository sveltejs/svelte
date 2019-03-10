import { assign } from '../internal';
import Stats from '../Stats';
import parse from '../parse/index';
import renderDOM from './render-dom/index';
import renderSSR from './render-ssr/index';
import { CompileOptions, Ast, Warning, CustomElementOptions } from '../interfaces';
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
	'immutable',
	'hydratable',
	'legacy',
	'customElement',
	'css',
	'preserveComments'
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

	if ('customElement' in options) {
		options.customElement = normalize_customElement_option(options.customElement);
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

const valid_customElement_options = ['tag'];

function normalize_customElement_option(customElement: boolean | string | CustomElementOptions) {
	if (typeof customElement === 'boolean') {
		return customElement ? {} : null;
	} else if (typeof customElement === 'string') {
		customElement = { tag: customElement };
	} else if (typeof customElement === 'object') {
		Object.keys(customElement).forEach(key => {
			if (valid_customElement_options.indexOf(key) === -1) {
				const match = fuzzymatch(key, valid_customElement_options);
				let message = `Unrecognized option 'customElement.${key}'`;
				if (match) message += ` (did you mean 'customElement.${match}'?)`;

				throw new Error(message);
			}
		});
	} else {
		throw new Error(`options.customElement must be a boolean, a string or an object`);
	}

	if ('tag' in customElement && !/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(customElement.tag)) {
		throw new Error(`options.customElement tag name must be two or more words joined by the '-' character`);
	}

	return customElement;
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
		options.name || get_name(options.filename) || 'SvelteComponent',
		options,
		stats,
		warnings
	);
	stats.stop('create component');

	const js = options.generate === false
		? null
		: options.generate === 'ssr'
			? renderSSR(component, options)
			: renderDOM(component, options);

	return component.generate(js);
}