/**
 * @param {import('./Attribute.js').default | import('./Binding.js').default} attr
 * @param {Set<string>} dependencies
 */
export default function handle_select_value_binding(attr, dependencies) {
	const { parent } = attr;
	if (parent.node.name === 'select') {
		/** @type {import('./index.js').default} */ (parent).select_binding_dependencies = dependencies;
		dependencies.forEach((prop) => {
			parent.renderer.component.indirect_dependencies.set(prop, new Set());
		});
	}
}
