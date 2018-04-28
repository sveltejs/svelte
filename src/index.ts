import parse from './parse/index';
import validate from './validate/index';
import generate from './generators/dom/index';
import generateSSR from './generators/server-side-rendering/index';
import Stats from './Stats';
import { assign } from './shared/index.js';
import Stylesheet from './css/Stylesheet';
import { Ast, CompileOptions, Warning, PreprocessOptions, Preprocessor } from './interfaces';
import { SourceMap } from 'magic-string';

const version = '__VERSION__';

function normalizeOptions(options: CompileOptions): CompileOptions {
	let normalizedOptions = assign({ generate: 'dom' }, options);
	const { onwarn, onerror } = normalizedOptions;
	normalizedOptions.onwarn = onwarn
		? (warning: Warning) => onwarn(warning, defaultOnwarn)
		: defaultOnwarn;
	normalizedOptions.onerror = onerror
		? (error: Error) => onerror(error, defaultOnerror)
		: defaultOnerror;
	return normalizedOptions;
}

function defaultOnwarn(warning: Warning) {
	if (warning.start) {
		console.warn(
			`(${warning.start.line}:${warning.start.column}) – ${warning.message}`
		); // eslint-disable-line no-console
	} else {
		console.warn(warning.message); // eslint-disable-line no-console
	}
}

function defaultOnerror(error: Error) {
	throw error;
}

function parseAttributeValue(value: string) {
	return /^['"]/.test(value) ?
		value.slice(1, -1) :
		value;
}

function parseAttributes(str: string) {
	const attrs = {};
	str.split(/\s+/).filter(Boolean).forEach(attr => {
		const [name, value] = attr.split('=');
		attrs[name] = value ? parseAttributeValue(value) : true;
	});
	return attrs;
}

async function replaceTagContents(source, type: 'script' | 'style', preprocessor: Preprocessor, options: PreprocessOptions) {
	const exp = new RegExp(`<${type}([\\S\\s]*?)>([\\S\\s]*?)<\\/${type}>`, 'ig');
	const match = exp.exec(source);

	if (match) {
		const attributes: Record<string, string | boolean> = parseAttributes(match[1]);
		const content: string = match[2];
		const processed: { code: string, map?: SourceMap | string } = await preprocessor({
			content,
			attributes,
			filename : options.filename
		});

		if (processed && processed.code) {
			return (
				source.slice(0, match.index) +
				`<${type}>${processed.code}</${type}>` +
				source.slice(match.index + match[0].length)
			);
		}
	}

	return source;
}

export async function preprocess(source: string, options: PreprocessOptions) {
	const { markup, style, script } = options;
	if (!!markup) {
		const processed: { code: string, map?: SourceMap | string } = await markup({
			content: source,
			filename: options.filename
		});
		source = processed.code;
	}

	if (!!style) {
		source = await replaceTagContents(source, 'style', style, options);
	}

	if (!!script) {
		source = await replaceTagContents(source, 'script', script, options);
	}

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		toString() {
			return source;
		}
	};
}

function compile(source: string, _options: CompileOptions) {
	const options = normalizeOptions(_options);
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
		return { ast: ast, stats, js: null, css: null };
	}

	const compiler = options.generate === 'ssr' ? generateSSR : generate;

	return compiler(ast, source, stylesheet, options, stats);
};

function create(source: string, _options: CompileOptions = {}) {
	_options.format = 'eval';

	const compiled = compile(source, _options);

	if (!compiled || !compiled.js.code) {
		return;
	}

	try {
		return (new Function(`return ${compiled.js.code}`))();
	} catch (err) {
		if (_options.onerror) {
			_options.onerror(err);
			return;
		} else {
			throw err;
		}
	}
}

export { parse, create, compile, version as VERSION };
