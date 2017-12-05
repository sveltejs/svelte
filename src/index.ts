import parse from './parse/index';
import validate from './validate/index';
import generate from './generators/dom/index';
import generateSSR from './generators/server-side-rendering/index';
import { assign } from './shared/index.js';
import Stylesheet from './css/Stylesheet';
import { Parsed, CompileOptions, Warning, PreprocessOptions, Preprocessor } from './interfaces';
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
	if (warning.loc) {
		console.warn(
			`(${warning.loc.line}:${warning.loc.column}) – ${warning.message}`
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
			options
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
			options
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

export function compile(source: string, _options: CompileOptions) {
	const options = normalizeOptions(_options);
	let parsed: Parsed;

	try {
		parsed = parse(source, options);
	} catch (err) {
		options.onerror(err);
		return;
	}

	const stylesheet = new Stylesheet(source, parsed, options.filename, options.cascade !== false);

	validate(parsed, source, stylesheet, options);

	const compiler = options.generate === 'ssr' ? generateSSR : generate;

	return compiler(parsed, source, stylesheet, options);
};

export function create(source: string, _options: CompileOptions = {}) {
	_options.format = 'eval';

	const compiled = compile(source, _options);

	if (!compiled || !compiled.code) {
		return;
	}

	try {
		return (0, eval)(compiled.code);
	} catch (err) {
		if (_options.onerror) {
			_options.onerror(err);
			return;
		} else {
			throw err;
		}
	}
}

export { parse, validate, version as VERSION };
