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
	let normalizedOptions = assign({ generate: 'dom', preprocessor: false }, options);
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

function _parseAttributeValue(value: string | boolean) {
	const curated = (<string>value).replace(/"/ig, '');
	if (curated === 'true' || curated === 'false') {
		return curated === 'true';
	}
	return curated;
}

function _parseStyleAttributes(str: string) {
	const attrs = {};
	str.split(/\s+/).filter(Boolean).forEach(attr => {
		const [name, value] = attr.split('=');
		attrs[name] = _parseAttributeValue(value);
	});
	return attrs;
}

async function _doPreprocess(source, type: 'script' | 'style', preprocessor: Preprocessor) {
	const exp = new RegExp(`<${type}([\\S\\s]*?)>([\\S\\s]*?)<\\/${type}>`, 'ig');
	const match = exp.exec(source);
	if (match) {
		const attributes: Record<string, string | boolean> = _parseStyleAttributes(match[1]);
		const content: string = match[2];
		const processed: { code: string, map?: SourceMap | string } = await preprocessor({
			content,
			attributes
		});
		return source.replace(content, processed.code || content);
	}
}

export async function preprocess(source: string, options: PreprocessOptions) {
	const { markup, style, script } = options;
	if (!!markup) {
		try {
			const processed: { code: string, map?: SourceMap | string } = await markup({ content: source });
			source = processed.code;
		} catch (error) {
			defaultOnerror(error);
		}
	}

	if (!!style) {
		try {
			source = await _doPreprocess(source, 'style', style);
		} catch (error) {
			defaultOnerror(error);
		}
	}

	if (!!script) {
		try {
			source = await _doPreprocess(source, 'script', script);
		} catch (error) {
			defaultOnerror(error);
		}
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
