/** @import { Binding } from '#compiler' */

/**
 * Returns `true` if a binding unambiguously resolves to a specific
 * snippet declaration, or is external to the current component
 * @param {Binding | null} binding
 */
export function is_resolved_snippet(binding) {
	return (
		!binding ||
		binding.declaration_kind === 'import' ||
		binding.kind === 'prop' ||
		binding.kind === 'rest_prop' ||
		binding.kind === 'bindable_prop' ||
		binding?.initial?.type === 'SnippetBlock'
	);
}
