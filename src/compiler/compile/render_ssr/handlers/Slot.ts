import Renderer, { RenderOptions } from '../Renderer';
import Slot from '../../nodes/Slot';
import { x, b } from 'code-red';
import get_slot_data from '../../utils/get_slot_data';
import { get_slot_scope } from './shared/get_slot_scope';

export default function(node: Slot, renderer: Renderer, options: RenderOptions) {
	const slot_data = get_slot_data(node.values);
	const slot = node.get_static_attribute_value('slot');
	const nearest_inline_component = node.find_nearest(/InlineComponent/);

	if (slot && nearest_inline_component) {
		renderer.push();
	}

	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();

	renderer.add_expression(x`
		#slots.${node.slot_name}
			? #slots.${node.slot_name}(${slot_data})
			: ${result}
	`);

	if (slot && nearest_inline_component) {
		const lets = node.lets;
		const seen = new Set(lets.map(l => l.name.name));

		nearest_inline_component.lets.forEach(l => {
			if (!seen.has(l.name.name)) lets.push(l);
		});

		options.slot_scopes.push(b`#slots_definition['${node.slot_template_name}'] = 
			(${get_slot_scope(node.lets)}) => ${renderer.pop()};
		`);
	}
}
