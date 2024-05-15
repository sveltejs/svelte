import svelte_config from '@sveltejs/eslint-config';
import lube from 'eslint-plugin-lube';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	...svelte_config,
	{
		plugins: {
			lube
		},
		rules: {
			'no-console': 'error',
			'lube/svelte-naming-convention': ['error', { fixSameNames: true }],
			// eslint isn't that well-versed with JSDoc to know that `foo: /** @type{..} */ (foo)` isn't a violation of this rule, so turn it off
			'object-shorthand': 'off',
			'no-var': 'off',

			// TODO: enable these rules and run `pnpm lint:fix`
			// skipping that for now so as to avoid impacting real work
			'@stylistic/quotes': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'prefer-const': 'off'
		}
	},
	{
		files: ['playgrounds/**/*'],
		rules: {
			'lube/svelte-naming-convention': 'off',
			'no-console': 'off'
		}
	},
	{
		ignores: [
			'**/*.d.ts',
			'**/tests',
			'packages/svelte/scripts/process-messages/templates/*.js',
			'packages/svelte/src/compiler/errors.js',
			'packages/svelte/src/internal/client/errors.js',
			'packages/svelte/src/internal/client/warnings.js',
			'packages/svelte/src/internal/shared/warnings.js',
			'packages/svelte/compiler/index.js',
			// documentation can contain invalid examples
			'documentation',
			// contains a fork of the REPL which doesn't adhere to eslint rules
			'sites/svelte-5-preview/**',
			'playgrounds/demo/src/**',
			'tmp/**',
			// wasn't checked previously, reenable at some point
			'sites/svelte.dev/**'
		]
	}
];
