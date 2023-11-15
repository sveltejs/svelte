module.exports = {
	extends: ['@sveltejs'],

	// TODO: add runes to eslint-plugin-svelte
	globals: {
		$state: true,
		$derived: true,
		$effect: true,
		$props: true
	},

	overrides: [
		{
			// scripts and playground should be console logging so don't lint against them
			files: ['playgrounds/**/*', 'scripts/**/*'],
			rules: {
				'no-console': 'off'
			}
		},
		{
			// the playgrounds can use public naming conventions since they're examples
			files: ['playgrounds/**/*'],
			rules: {
				'lube/svelte-naming-convention': 'off'
			}
		},
		{
			files: ['packages/svelte/src/compiler/**/*'],
			rules: {
				'no-var': 'error'
			}
		}
	],

	plugins: ['lube'],

	rules: {
		'no-console': 'error',
		'lube/svelte-naming-convention': ['error', { fixSameNames: true }],
		// eslint isn't that well-versed with JSDoc to know that `foo: /** @type{..} */ (foo)` isn't a violation of this rule, so turn it off
		'object-shorthand': 'off',
		'no-var': 'off',

		// TODO: enable these rules and run `pnpm lint:fix`
		// skipping that for now so as to avoid impacting real work
		'@typescript-eslint/array-type': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'prefer-const': 'off',
		'svelte/valid-compile': 'off',
		quotes: 'off'
	}
};
