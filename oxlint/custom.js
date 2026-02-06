// @ts-check
import { eslintCompatPlugin } from '@oxlint/plugins';

const plugin = eslintCompatPlugin({
	meta: {
		name: 'custom'
	},
	rules: {
		// Enforce that there are no imports to the compiler in runtime code.
		// This prevents accidental inclusion of the compiler runtime and
		// ensures that TypeScript does not pick up more ambient types
		// (for example from Node) that shouldn't be available in the browser.
		'no-compiler-imports': {
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
		}
	}
});

export default plugin;
