import Stats from '../Stats';
import parse from '../parse/index';
import render_dom from './render_dom/index';
import render_ssr from './render_ssr/index';
import { CompileOptions, Warning } from '../interfaces';
import Component from './Component';
import fuzzymatch from '../utils/fuzzymatch';
import get_name_from_filename from './utils/get_name_from_filename';
import { valid_namespaces } from '../utils/namespaces';

const valid_options = [
	'format',
	'name',
	'filename',
	'sourcemap',
	'enableSourcemap',
	'generate',
	'errorMode',
	'varsReport',
	'outputFilename',
	'cssOutputFilename',
	'sveltePath',
	'dev',
	'accessors',
	'immutable',
	'hydratable',
	'legacy',
	'customElement',
	'namespace',
	'tag',
	'css',
	'loopGuardTimeout',
	'preserveComments',
	'preserveWhitespace',
	'cssHash'
];

const regex_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
const regex_starts_with_lowercase_character = /^[a-z]/;

function validate_options(options: CompileOptions, warnings: Warning[]) {
	const { name, filename, loopGuardTimeout, dev, namespace } = options;

	Object.keys(options).forEach(key => {
		if (!valid_options.includes(key)) {
			const match = fuzzymatch(key, valid_options);
			let message = `Unrecognized option '${key}'`;
			if (match) message += ` (did you mean '${match}'?)`;

			throw new Error(message);
		}
	});

	if (name && !regex_valid_identifier.test(name)) {
		throw new Error(`options.name must be a valid identifier (got '${name}')`);
	}

	if (name && regex_starts_with_lowercase_character.test(name)) {
		const message = 'options.name should be capitalised';
		warnings.push({
			code: 'options-lowercase-name',
			message,
			filename,
			toString: () => message
		});
	}

	if (loopGuardTimeout && !dev) {
		const message = 'options.loopGuardTimeout is for options.dev = true only';
		warnings.push({
			code: 'options-loop-guard-timeout',
			message,
			filename,
			toString: () => message
		});
	}

	if (namespace && valid_namespaces.indexOf(namespace) === -1) {
		const match = fuzzymatch(namespace, valid_namespaces);
		if (match) {
			throw new Error(`Invalid namespace '${namespace}' (did you mean '${match}'?)`);
		} else {
			throw new Error(`Invalid namespace '${namespace}'`);
		}
	}
}

export default function compile(source: string, options: CompileOptions = {}) {
	options = Object.assign({ generate: 'dom', dev: false, enableSourcemap: true }, options);

	const stats = new Stats();
	const warnings = [];

	validate_options(options, warnings);

	stats.start('parse');
	const ast = parse(source, options);
	stats.stop('parse');

	stats.start('create component');
	const component = new Component(
		ast,
		source,
		options.name || get_name_from_filename(options.filename) || 'Component',
		options,
		stats,
		warnings
	);
	stats.stop('create component');

	const result = options.generate === false
		? null
		: options.generate === 'ssr'
			? render_ssr(component, options)
			: render_dom(component, options);

	return component.generate(result);
}
