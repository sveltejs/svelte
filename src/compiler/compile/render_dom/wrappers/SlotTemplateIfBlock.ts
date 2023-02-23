import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import { Identifier } from 'estree';
import SlotTemplateIfBlock from '../../nodes/SlotTemplateIfBlock';
import SlotTemplateWrapper from './SlotTemplate';
import SlotTemplate from '../../nodes/SlotTemplate';
import { x, b } from 'code-red';
import InlineComponentWrapper from './InlineComponent';
import TemplateScope from '../../nodes/shared/TemplateScope';
import { add_const_tags, add_const_tags_context } from './shared/add_const_tags';

export default class SlotTemplateIfBlockWrapper extends Wrapper {
	node: SlotTemplateIfBlock;
	needs_update = false;

	var: Identifier = { type: 'Identifier', name: 'if_block' };
	children: Array<SlotTemplateWrapper | SlotTemplateIfBlockWrapper> = [];
	else: Array<SlotTemplateWrapper | SlotTemplateIfBlockWrapper> = [];
	parent: SlotTemplateIfBlockWrapper | InlineComponentWrapper;
	scope: TemplateScope;

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

		add_const_tags_context(renderer, this.node.const_tags);

		for (const child of this.node.children) {
			if (child.type === 'SlotTemplate') {
				this.children.push(new SlotTemplateWrapper(renderer, block, this, child as SlotTemplate, strip_whitespace, next_sibling));
			} else if (child.type === 'SlotTemplateIfBlock') {
				this.children.push(new SlotTemplateIfBlockWrapper(renderer, block, this, child as SlotTemplateIfBlock, strip_whitespace, next_sibling));
			}
		}

		if (node.else) {
			add_const_tags_context(renderer, this.node.else.const_tags);
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
		let if_get_context;
		let else_get_context;

		if (this.node.const_tags.length) {
			if_get_context = block.renderer.component.get_unique_name('get_context');
			block.renderer.blocks.push(b`
				function ${if_get_context}(#ctx) {
					${add_const_tags(block, this.node.const_tags, '#ctx')}
				}
			`);
		}
		if (this.node.else && this.node.else.const_tags.length) {
			else_get_context = block.renderer.component.get_unique_name('get_context');
			block.renderer.blocks.push(b`
				function ${else_get_context}(#ctx) {
					${add_const_tags(block, this.node.const_tags, '#ctx')}
				}
			`);
		}

		if (this.else.length > 0) {
			return b`
			if (${this.node.expression.manipulate(block, '#ctx')}) {
				${if_get_context ? x`${if_get_context}(#ctx)` : null}
				${this.children.map(slot => slot.render_slot_template_definition(block))}
			} else {
				${else_get_context ? x`${else_get_context}(#ctx)` : null}
				${this.else.map(slot => slot.render_slot_template_definition(block))}
			}
			`;
		}

		return b`
			if (${this.node.expression.manipulate(block, '#ctx')}) {
				${if_get_context ? x`${if_get_context}(#ctx)` : null}
				${this.children.map(slot => slot.render_slot_template_definition(block))}
			}
		`;
	}
}
