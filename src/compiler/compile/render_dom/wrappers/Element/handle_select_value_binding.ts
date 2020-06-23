import AttributeWrapper from "./Attribute";
import BindingWrapper from "./Binding";
import ElementWrapper from "./index";

export default function handle_select_value_binding(
	attr: AttributeWrapper | BindingWrapper,
	dependencies: Set<string>
) {
	const { parent } = attr;
	if (parent.node.name === "select") {
		(parent as ElementWrapper).select_binding_dependencies = dependencies;
		dependencies.forEach((prop: string) => {
			parent.renderer.component.indirect_dependencies.set(prop, new Set());
		});
	}
}
