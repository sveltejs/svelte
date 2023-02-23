import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import FragmentWrapper from './Fragment';
import create_debugging_comment from './shared/create_debugging_comment';
import { get_slot_definition } from './shared/get_slot_definition';
import { b, x } from 'code-red';
import { sanitize } from '../../../utils/names';
import { Identifier, Node } from 'estree';
import InlineComponentWrapper from './InlineComponent';
import { extract_names } from 'periscopic';
import SlotTemplate from '../../nodes/SlotTemplate';
import { add_const_tags, add_const_tags_context } from './shared/add_const_tags';
import TemplateScope from '../../nodes/shared/TemplateScope';
import SlotTemplateIfBlockWrapper from './SlotTemplateIfBlock';
import { INode } from '../../nodes/interfaces';

export default class SlotTemplateWrapper extends Wrapper {
	node: SlotTemplate;
	fragment: FragmentWrapper;
	block: Block;
	parent: InlineComponentWrapper | SlotTemplateIfBlockWrapper;
	slot_template_name: string;
	slot_definition: Node;
	scope: TemplateScope;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: SlotTemplate,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		const { scope, lets, const_tags, slot_template_name } = this.node;

		lets.forEach(l => {
			extract_names(l.value || l.name).forEach(name => {
				renderer.add_to_context(name, true);
			});
		});

		add_const_tags_context(renderer, const_tags);

		this.block = block.child({
			comment: create_debugging_comment(this.node, this.renderer.component),
			name: this.renderer.component.get_unique_name(
				`create_${sanitize(slot_template_name)}_slot`
			),
			type: 'slot'
		});
		this.renderer.blocks.push(this.block);

		const seen = new Set(lets.map(l => l.name.name));
		const component_parent = this.get_component_parent();
		component_parent.node.lets.forEach(l => {
			if (!seen.has(l.name.name)) lets.push(l);
		});

		const slot_definition = get_slot_definition(this.block, scope, lets);

		this.slot_template_name = slot_template_name;
		this.slot_definition = x`[${slot_definition.block.name}, ${slot_definition.get_context || null}, ${slot_definition.get_changes || null}]`;
		this.scope = scope;

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			node.type === 'SlotTemplate' ? node.children : [node],
			this,
			strip_whitespace,
			next_sibling
		);

		this.block.parent.add_dependencies(this.block.dependencies);
	}

	render_slot_template_content(should_cache: boolean) {
		this.fragment.render(this.block, null, x`#nodes` as Identifier);

		if (this.node.const_tags.length > 0) {
			this.render_get_context();
		}

		if (this.slot_template_name === 'default' && !this.block.has_content()) {
			this.renderer.remove_block(this.block);
			this.slot_definition = null;
		}

		if (this.slot_definition && should_cache) {
			const cached_name = this.renderer.component.get_unique_name(`${this.slot_template_name}_definition`);
			this.renderer.blocks.push(b`var ${cached_name} = ${this.slot_definition};`);
			this.slot_definition = cached_name;
		}
	}

	render_slot_template_definition(_block: Block) {
		return b`#slots_definition["${this.slot_template_name}"] = ${this.slot_definition};`;
	}

	render_get_context() {
		const if_const_tags = [];
		let parent = this.node.parent;
		while (parent.type === 'SlotTemplateIfBlock' || parent.type === 'SlotTemplateElseBlock') {
			if_const_tags.push(parent.const_tags);
			if (parent.type === 'SlotTemplateElseBlock') parent = parent.parent;
			parent = parent.parent;
		}
		const const_tags = [];
		for (let i = if_const_tags.length - 1; i >= 0; i--) {
			const_tags.push(...if_const_tags[i]);
		}
		const_tags.push(...this.node.const_tags);

		const get_context = this.block.renderer.component.get_unique_name('get_context');
		this.block.renderer.blocks.push(b`
			function ${get_context}(#ctx) {
				${add_const_tags(this.block, const_tags, '#ctx')}
			}
		`);
		this.block.chunks.declarations.push(b`${get_context}(#ctx)`);
		if (this.block.has_update_method) {
			this.block.chunks.update.unshift(b`${get_context}(#ctx)`);
		}
	}

	get_component_parent() {
		let parent: Wrapper = this.parent;
		while (parent.node.type !== 'InlineComponent') parent = parent.parent;
		return parent as InlineComponentWrapper;
	}
}
