import Renderer, { RenderOptions } from '../Renderer';
import { b } from 'code-red';
import SlotTemplateIfBlock from '../../nodes/SlotTemplateIfBlock';
import { flatten } from '../../../utils/flatten';

export default function (node: SlotTemplateIfBlock, renderer: Renderer, options: RenderOptions) {
	const if_slot_scopes = [];
	renderer.render(node.children, Object.assign({}, options, {
		slot_scopes: if_slot_scopes
	}));

	if (node.else) {
		const else_slot_scopes = [];
		renderer.render(node.else.children, Object.assign({}, options, {
			slot_scopes: else_slot_scopes
		}));
		options.slot_scopes.push(b`
			if (${node.expression.node}) {
				${if_slot_scopes}
			} else {
				${else_slot_scopes}
			}
		`);
	} else {
		options.slot_scopes.push(b`if (${node.expression.node}) {
			${flatten(if_slot_scopes)}
		}`);
	}
}
