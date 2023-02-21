import Renderer from "../../Renderer";
import SlotTemplateWrapper from "../SlotTemplate";
import SlotTemplateIfBlockWrapper from "../SlotTemplateIfBlock";
import is_dynamic from "./is_dynamic";

export function collect_slot_fragment_dependencies(
	renderer: Renderer,
	children: Array<SlotTemplateIfBlockWrapper | SlotTemplateWrapper>,
	fragment_dependencies: Set<string>
) {
	function collect(
		children: Array<SlotTemplateWrapper | SlotTemplateIfBlockWrapper>
	) {
		for (const child of children) {
			if (child instanceof SlotTemplateIfBlockWrapper) {
				collect(child.children);
				collect(child.else);
				for (const dep of child.node.expression.dependencies) {
					const is_let = child.scope.is_let(dep);
					const variable = renderer.component.var_lookup.get(dep);
					if (is_let || is_dynamic(variable)) fragment_dependencies.add(dep);
				}
			} else {
				for (const dep of child.block.dependencies) {
					const is_let = child.scope.is_let(dep);
					const variable = renderer.component.var_lookup.get(dep);
					if (is_let || is_dynamic(variable)) fragment_dependencies.add(dep);
				}
			}
		}
	}
	collect(children);
}

export function collect_slot_dynamic_dependencies(children: Array<SlotTemplateIfBlockWrapper | SlotTemplateWrapper>) {
	const result = new Set<string>();

	function collect(children: Array<SlotTemplateIfBlockWrapper | SlotTemplateWrapper>) {
		for (const child of children) {
			if (child instanceof SlotTemplateIfBlockWrapper) {
				for (const dep of child.node.expression.dynamic_dependencies()) {
					result.add(dep);
				}
				collect(child.children);
				collect(child.else);
			}
		}
	}
	collect(children);

	return result;
}