// @ts-check
import { definePlugin } from '@oxlint/plugins';

export default definePlugin({
	meta: {
		name: 'custom'
	},
	rules: {
		// Enforce that there are no imports to the compiler in runtime code.
		// This prevents accidental inclusion of the compiler runtime and
		// ensures that TypeScript does not pick up more ambient types
		// (for example from Node) that shouldn't be available in the browser.
		'no-compiler-imports': {
			createOnce(context) {
				return {
					before() {
						// Skip files in the compiler directory - this rule is only for runtime code
						if (context.filename.includes('/src/compiler/')) {
							return false;
						}
					},
					Program: () => {
						// Do a simple string search because Oxlint doesn't provide a way to check JSDoc comments.
						// The string search could in theory yield false positives, but in practice it's unlikely.
						const text = context.sourceCode.getText();

						const match = /(?:(\.\.\/)(compiler)\/|(#compiler))/.exec(text);

						if (match) {
							const offset = match[1]?.length ?? 0;
							const length = (match[2] || match[3]).length;

							const start = match.index + offset;
							const end = start + length;

							context.report({
								loc: {
									start: context.sourceCode.getLocFromIndex(start),
									end: context.sourceCode.getLocFromIndex(end)
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
