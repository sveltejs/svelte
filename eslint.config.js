import svelte_config from '@sveltejs/eslint-config';
import lube from 'eslint-plugin-lube';

const no_compiler_imports = {
	meta: {
		type: /** @type {const} */ ('problem'),
		docs: {
			description:
				'Enforce that there are no imports to the compiler in runtime code. ' +
				'This prevents accidental inclusion of the compiler runtime and ' +
				"ensures that TypeScript does not pick up more ambient types (for example from Node) that shouldn't be available in the browser."
		}
	},
	create(context) {
		return {
			Program: () => {
				// Do a simple string search because ESLint doesn't provide a way to check JSDoc comments.
				// The string search could in theory yield false positives, but in practice it's unlikely.
				const text = context.sourceCode.getText();
				const idx = Math.max(text.indexOf('../compiler/'), text.indexOf('#compiler'));
				if (idx !== -1) {
					context.report({
						loc: {
							start: context.sourceCode.getLocFromIndex(idx),
							end: context.sourceCode.getLocFromIndex(idx + 12)
						},
						message:
							'References to compiler code are forbidden in runtime code (both for type and value imports)'
					});
				}
			}
		};
	}
};

/** @type {import('eslint').Linter.Config[]} */
export default [
	...svelte_config,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		plugins: {
			lube,
			custom: { rules: { no_compiler_imports } }
		},
		rules: {
			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/require-await': 'error',
			'no-console': 'error',
			'lube/svelte-naming-convention': ['error', { fixSameNames: true }],
			// eslint isn't that well-versed with JSDoc to know that `foo: /** @type{..} */ (foo)` isn't a violation of this rule, so turn it off
			'object-shorthand': 'off',
			// eslint is being a dummy here too
			'@typescript-eslint/prefer-promise-reject-errors': 'off',
			'no-var': 'off',

			// TODO: enable these rules and run `pnpm lint:fix`
			// skipping that for now so as to avoid impacting real work
			'@stylistic/quotes': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'prefer-const': 'off'
		}
	},
	{
		// If you get an error along the lines of "@typescript-eslint/await-thenable needs a project service configured", then that likely means
		// that eslint rules that need to be type-aware run through a Svelte file which seems unsupported at the moment. In that case, ensure that
		// these are excluded to run on Svelte files.
		files: ['**/*.svelte'],
		rules: {
			'@typescript-eslint/await-thenable': 'off',
			'@typescript-eslint/prefer-promise-reject-errors': 'off',
			'@typescript-eslint/require-await': 'off'
		}
	},
	{
		files: ['packages/svelte/src/**/*'],
		ignores: ['packages/svelte/src/compiler/**/*'],
		rules: {
			'custom/no_compiler_imports': 'error',
			'svelte/no-svelte-internal': 'off'
		}
	},
	{
		ignores: [
			'**/*.d.ts',
			'**/tests',
			'packages/svelte/scripts/process-messages/templates/*.js',
			'packages/svelte/scripts/_bundle.js',
			'packages/svelte/src/compiler/errors.js',
			'packages/svelte/src/internal/client/errors.js',
			'packages/svelte/src/internal/client/warnings.js',
			'packages/svelte/src/internal/shared/warnings.js',
			'packages/svelte/src/internal/server/warnings.js',
			'packages/svelte/compiler/index.js',
			// stuff we don't want to lint
			'benchmarking/**',
			'coverage/**',
			'playgrounds/sandbox/**',
			// exclude top level config files
			'*.config.js',
			'vitest-xhtml-environment.ts',
			// documentation can contain invalid examples
			'documentation',
			'tmp/**'
		]
	}
];
