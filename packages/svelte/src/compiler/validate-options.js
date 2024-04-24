import * as e from './errors.js';
import * as w from './warnings.js';

/**
 * @template [Input=any]
 * @template [Output=Input]
 * @typedef {(input: Input, keypath: string) => Required<Output>} Validator
 */

const common = {
	filename: string(undefined),

	dev: boolean(false),

	generate: validator('client', (input, keypath) => {
		if (input === 'dom' || input === 'ssr') {
			warn_once(w.options_renamed_ssr_dom);
			return input === 'dom' ? 'client' : 'server';
		}

		// TODO deprecate `false` in favour of `analyze`/`analyzeModule` https://github.com/sveltejs/svelte-octane/issues/655
		if (input !== 'client' && input !== 'server' && input !== false) {
			throw_error(`${keypath} must be "client", "server" or false`);
		}

		return input;
	})
};

export const validate_module_options =
	/** @type {Validator<import('#compiler').ModuleCompileOptions, import('#compiler').ValidatedModuleCompileOptions>} */ (
		object({
			...common
		})
	);

export const validate_component_options =
	/** @type {Validator<import('#compiler').CompileOptions, import('#compiler').ValidatedCompileOptions>} */ (
		object({
			...common,

			accessors: deprecate(w.options_deprecated_accessors, boolean(false)),

			css: validator('external', (input) => {
				if (input === true || input === false) {
					throw_error(
						'The boolean options have been removed from the css option. Use "external" instead of false and "injected" instead of true'
					);
				}
				if (input === 'none') {
					throw_error(
						'css: "none" is no longer a valid option. If this was crucial for you, please open an issue on GitHub with your use case.'
					);
				}

				if (input !== 'external' && input !== 'injected') {
					throw_error(`css should be either "external" (default, recommended) or "injected"`);
				}

				return input;
			}),

			cssHash: fun(({ css, hash }) => {
				return `svelte-${hash(css)}`;
			}),

			// TODO this is a sourcemap option, would be good to put under a sourcemap namespace
			cssOutputFilename: string(undefined),

			customElement: boolean(false),

			discloseVersion: boolean(true),

			immutable: deprecate(w.options_deprecated_immutable, boolean(false)),

			legacy: object({
				componentApi: boolean(false)
			}),

			loopGuardTimeout: warn_removed(w.options_removed_loop_guard_timeout),

			name: string(undefined),

			namespace: list(['html', 'svg', 'foreign']),

			outputFilename: string(undefined),

			preserveComments: boolean(false),

			preserveWhitespace: boolean(false),

			runes: boolean(undefined),

			hmr: boolean(false),

			sourcemap: validator(undefined, (input) => {
				// Source maps can take on a variety of values, including string, JSON, map objects from magic-string and source-map,
				// so there's no good way to check type validity here
				return input;
			}),

			enableSourcemap: warn_removed(w.options_removed_enable_sourcemap),
			hydratable: warn_removed(w.options_removed_hydratable),
			format: removed(
				'The format option has been removed in Svelte 4, the compiler only outputs ESM now. Remove "format" from your compiler options. ' +
					'If you did not set this yourself, bump the version of your bundler plugin (vite-plugin-svelte/rollup-plugin-svelte/svelte-loader)'
			),
			tag: removed(
				'The tag option has been removed in Svelte 5. Use `<svelte:options customElement="tag-name" />` inside the component instead. ' +
					'If that does not solve your use case, please open an issue on GitHub with details.'
			),
			sveltePath: removed(
				'The sveltePath option has been removed in Svelte 5. ' +
					'If this option was crucial for you, please open an issue on GitHub with your use case.'
			),
			// These two were primarily created for svelte-preprocess (https://github.com/sveltejs/svelte/pull/6194),
			// but with new TypeScript compilation modes strictly separating types it's not necessary anymore
			errorMode: removed(
				'The errorMode option has been removed. If you are using this through svelte-preprocess with TypeScript, ' +
					'use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead'
			),
			varsReport: removed(
				'The vars option has been removed. If you are using this through svelte-preprocess with TypeScript, ' +
					'use the https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead'
			)
		})
	);

/**
 * @param {string} msg
 * @returns {Validator}
 */
function removed(msg) {
	return (input) => {
		if (input !== undefined) {
			e.removed_compiler_option(null, msg);
		}
		return /** @type {any} */ (undefined);
	};
}

const warned = new Set();

/** @param {(node: null) => void} fn */
function warn_once(fn) {
	if (!warned.has(fn)) {
		warned.add(fn);
		fn(null);
	}
}

/**
 * @param {(node: null) => void} fn
 * @returns {Validator}
 */
function warn_removed(fn) {
	return (input) => {
		if (input !== undefined) warn_once(fn);
		return /** @type {any} */ (undefined);
	};
}

/**
 * @param {(node: null) => void} fn
 * @param {Validator} validator
 * @returns {Validator}
 */
function deprecate(fn, validator) {
	return (input, keypath) => {
		if (input !== undefined) warn_once(fn);
		return validator(input, keypath);
	};
}

/**
 * @param {Record<string, Validator>} children
 * @param {boolean} [allow_unknown]
 * @returns {Validator}
 */
function object(children, allow_unknown = false) {
	return (input, keypath) => {
		/** @type {Record<string, any>} */
		const output = {};

		if ((input && typeof input !== 'object') || Array.isArray(input)) {
			throw_error(`${keypath} should be an object`);
		}

		for (const key in input) {
			if (!(key in children)) {
				if (allow_unknown) {
					output[key] = input[key];
				} else {
					e.invalid_compiler_option(
						null,
						`Unexpected option ${keypath ? `${keypath}.${key}` : key}`
					);
				}
			}
		}

		for (const key in children) {
			const validator = children[key];
			output[key] = validator(input && input[key], keypath ? `${keypath}.${key}` : key);
		}

		return output;
	};
}

/**
 * @param {any} fallback
 * @param {(value: any, keypath: string) => any} fn
 * @returns {Validator}
 */
function validator(fallback, fn) {
	return (input, keypath) => {
		return input === undefined ? fallback : fn(input, keypath);
	};
}

/**
 * @param {number} fallback
 * @returns {Validator}
 */
function number(fallback) {
	return validator(fallback, (input, keypath) => {
		if (typeof input !== 'number') {
			throw_error(`${keypath} should be a number, if specified`);
		}
		return input;
	});
}

/**
 * @param {string | undefined} fallback
 * @param {boolean} allow_empty
 * @returns {Validator}
 */
function string(fallback, allow_empty = true) {
	return validator(fallback, (input, keypath) => {
		if (typeof input !== 'string') {
			throw_error(`${keypath} should be a string, if specified`);
		}

		if (!allow_empty && input === '') {
			throw_error(`${keypath} cannot be empty`);
		}

		return input;
	});
}

/**
 * @param {boolean | undefined} fallback
 * @returns {Validator}
 */
function boolean(fallback) {
	return validator(fallback, (input, keypath) => {
		if (typeof input !== 'boolean') {
			throw_error(`${keypath} should be true or false, if specified`);
		}
		return input;
	});
}

/**
 * @param {Array<boolean | string | number>} options
 * @returns {Validator}
 */
function list(options, fallback = options[0]) {
	return validator(fallback, (input, keypath) => {
		if (!options.includes(input)) {
			// prettier-ignore
			const msg = options.length > 2
				? `${keypath} should be one of ${options.slice(0, -1).map(input => `"${input}"`).join(', ')} or "${options[options.length - 1]}"`
				: `${keypath} should be either "${options[0]}" or "${options[1]}"`;

			throw_error(msg);
		}
		return input;
	});
}

/**
 * @param {(...args: any) => any} fallback
 * @returns {Validator}
 */
function fun(fallback) {
	return validator(fallback, (input, keypath) => {
		if (typeof input !== 'function') {
			throw_error(`${keypath} should be a function, if specified`);
		}
		return input;
	});
}

/** @param {string} msg */
function throw_error(msg) {
	e.invalid_compiler_option(null, msg);
}
