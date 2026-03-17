/** @import { Validator } from '@sveltejs/config/validate' */
/** @import { ModuleCompileOptions, ValidatedModuleCompileOptions, CompileOptions, ValidatedCompileOptions } from '#compiler' */
import { string, boolean, object, fn, validator, ValidateError } from '@sveltejs/config/validate';
import * as e from './errors.js';
import * as w from './warnings.js';

const common_options = {
	filename: string('(unknown)'),

	// default to process.cwd() where it exists to replicate svelte4 behavior (and make Deno work with this as well)
	// see https://github.com/sveltejs/svelte/blob/b62fc8c8fd2640c9b99168f01b9d958cb2f7574f/packages/svelte/src/compiler/compile/Component.js#L211
	/* eslint-disable */
	rootDir: string(
		typeof process !== 'undefined'
			? process.cwd?.()
			: // @ts-expect-error
				typeof Deno !== 'undefined'
				? // @ts-expect-error
					Deno.cwd()
				: undefined
	),
	/* eslint-enable */

	dev: boolean(false),

	generate: validator(/** @type {string | false} */ ('client'), (input, keypath) => {
		if (input === 'dom' || input === 'ssr') {
			warn_once(w.options_renamed_ssr_dom);
			return input === 'dom' ? 'client' : 'server';
		}

		// TODO deprecate `false` in favour of `analyze`/`analyzeModule` https://github.com/sveltejs/svelte-octane/issues/655
		if (input !== 'client' && input !== 'server' && input !== false) {
			throw_error(`${keypath} must be "client", "server" or false`);
		}

		return /** @type {'client' | 'server' | false} */ (input);
	}),

	warningFilter: fn(() => true),

	experimental: object({
		async: boolean(false)
	})
};

const component_options = {
	accessors: deprecate(w.options_deprecated_accessors, boolean(false)),

	css: validator('external', (input) => {
		// @ts-expect-error
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

	cssHash: fn(({ css, filename, hash }) => {
		return `svelte-${hash(filename === '(unknown)' ? css : filename ?? css)}`;
	}),

	// TODO this is a sourcemap option, would be good to put under a sourcemap namespace
	cssOutputFilename: string(undefined),

	customElement: boolean(false),

	discloseVersion: boolean(true),

	immutable: deprecate(w.options_deprecated_immutable, boolean(false)),

	legacy: removed(
		'The legacy option has been removed. If you are using this because of legacy.componentApi, use compatibility.componentApi instead'
	),

	compatibility: object({
		componentApi: list([4, 5], 5)
	}),

	loopGuardTimeout: warn_removed(w.options_removed_loop_guard_timeout),

	name: string(undefined),

	namespace: list(['html', 'mathml', 'svg']),

	modernAst: boolean(false),

	outputFilename: string(undefined),

	preserveComments: boolean(false),

	fragments: list(['html', 'tree']),

	preserveWhitespace: boolean(false),

	/** @type {Validator<boolean | undefined | () => boolean | undefined, () => boolean | undefined>} */
	runes: parametric(() => /** @type {boolean | undefined} */ (undefined)),

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
};

const module_options_validator =
	/** @type {Validator<ModuleCompileOptions, ValidatedModuleCompileOptions>} */ (
		object({
			...common_options,
			...Object.fromEntries(Object.keys(component_options).map((key) => [key, () => {}]))
		})
	);

const component_options_validator =
	/** @type {Validator<CompileOptions, Omit<ValidatedCompileOptions, 'customElementOptions'>>} */ (
		object({
			...common_options,
			...component_options
		})
	);

/**
 * @param {ModuleCompileOptions} options
 */
export function validate_module_options(options) {
	try {
		return module_options_validator(options);
	} catch (e) {
		if (e instanceof ValidateError) {
			throw_error(e.message);
		}

		throw e;
	}
}

/**
 * @param {CompileOptions} options
 */
export function validate_component_options(options) {
	try {
		return component_options_validator(options);
	} catch (e) {
		if (e instanceof ValidateError) {
			throw_error(e.message);
		}

		throw e;
	}
}

/**
 * @template T
 * @param {string} msg
 * @returns {Validator<T>}
 */
function removed(msg) {
	return (input) => {
		if (input !== undefined) {
			e.options_removed(null, msg);
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
 * @template T
 * @param {(node: null) => void} fn
 * @returns {Validator<T>}
 */
function warn_removed(fn) {
	return (input) => {
		if (input !== undefined) warn_once(fn);
		return /** @type {any} */ (undefined);
	};
}

/**
 * @template T
 * @param {(node: null) => void} fn
 * @param {Validator<T>} validator
 * @returns {Validator<T>}
 */
function deprecate(fn, validator) {
	return (input, keypath) => {
		if (input !== undefined) warn_once(fn);
		return validator(input, keypath);
	};
}

/**
 * @template {boolean | string | number} T
 * @param {T[]} options
 * @returns {Validator<T>}
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
 * @template {(...args: any[]) => any} F
 * @param {F} fallback
 * @returns {Validator<ReturnType<F> | F, F>}
 */
function parametric(fallback) {
	return validator(fallback, (input) => {
		if (typeof input === 'function') {
			return /** @type {F} */ (input);
		}

		/** @type {(...args: Parameters<F>) => ReturnType<F>} */
		const normalized = (..._args) => /** @type {ReturnType<F>} */ (input);

		return /** @type {F} */ (/** @type {unknown} */ (normalized));
	});
}

/** @param {string} msg */
function throw_error(msg) {
	e.options_invalid_value(null, msg);
}
