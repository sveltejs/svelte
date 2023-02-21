import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import { Identifier } from 'estree';
import SlotTemplateIfBlock from '../../nodes/SlotTemplateIfBlock';
import SlotTemplateWrapper from './SlotTemplate';
import SlotTemplate from '../../nodes/SlotTemplate';
import { b } from 'code-red';
import InlineComponentWrapper from './InlineComponent';
import TemplateScope from '../../nodes/shared/TemplateScope';

export default class SlotTemplateIfBlockWrapper extends Wrapper {
	node: SlotTemplateIfBlock;
	needs_update = false;

	var: Identifier = { type: 'Identifier', name: 'if_block' };
	children: Array<SlotTemplateWrapper | SlotTemplateIfBlockWrapper> = [];
	else: Array<SlotTemplateWrapper | SlotTemplateIfBlockWrapper> = [];
	parent: SlotTemplateIfBlockWrapper | InlineComponentWrapper;
	scope: TemplateScope

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: SlotTemplateIfBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.scope = node.scope;

		for (const child of this.node.children) {
			if (child.type === 'SlotTemplate') {
				this.children.push(new SlotTemplateWrapper(renderer, block, this, child as SlotTemplate, strip_whitespace, next_sibling));
			} else if (child.type === 'SlotTemplateIfBlock') {
				this.children.push(new SlotTemplateIfBlockWrapper(renderer, block, this, child as SlotTemplateIfBlock, strip_whitespace, next_sibling));
			}
		}

		if (node.else) {
			for (const child of node.else.children) {
				if (child.type === 'SlotTemplate') {
					this.else.push(new SlotTemplateWrapper(renderer, block, this, child as SlotTemplate, strip_whitespace, next_sibling));
				} else if (child.type === 'SlotTemplateIfBlock') {
					this.else.push(new SlotTemplateIfBlockWrapper(renderer, block, this, child as SlotTemplateIfBlock, strip_whitespace, next_sibling));
				}
			}
		}
	}

	render_slot_template_content(should_cache: boolean) {
		this.children.forEach(slot => slot.render_slot_template_content(should_cache));
		this.else.forEach(slot => slot.render_slot_template_content(should_cache));
	}

	render_slot_template_definition(block: Block) {
		if (this.else.length > 0) {
			return b`
			if (${this.node.expression.manipulate(block, '#ctx')}) {
				${this.children.map(slot => slot.render_slot_template_definition(block))}
			} else {
				${this.else.map(slot => slot.render_slot_template_definition(block))}
			}
			`;
		}

		return b`
			if (${this.node.expression.manipulate(block, '#ctx')}) {
				${this.children.map(slot => slot.render_slot_template_definition(block))}
			}
		`;
	}
}
