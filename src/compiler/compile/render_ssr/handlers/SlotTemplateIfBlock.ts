import Renderer, { RenderOptions } from '../Renderer';
import { b } from 'code-red';
import SlotTemplateIfBlock from '../../nodes/SlotTemplateIfBlock';
import { get_const_tags } from './shared/get_const_tags';

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
				${get_const_tags(node.const_tags)}
				${if_slot_scopes}
			} else {
				${get_const_tags(node.else.const_tags)}
				${else_slot_scopes}
			}
		`);
	} else {
		options.slot_scopes.push(b`if (${node.expression.node}) {
			${get_const_tags(node.const_tags)}
			${if_slot_scopes}
		}`);
	}
}
