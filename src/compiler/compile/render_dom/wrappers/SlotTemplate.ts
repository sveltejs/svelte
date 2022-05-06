import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import FragmentWrapper from './Fragment';
import create_debugging_comment from './shared/create_debugging_comment';
import { get_slot_definition } from './shared/get_slot_definition';
import { b, x } from 'code-red';
import { sanitize } from '../../../utils/names';
import { Identifier } from 'estree';
import InlineComponentWrapper from './InlineComponent';
import { extract_names } from 'periscopic';
import SlotTemplate from '../../nodes/SlotTemplate';
import { add_const_tags, add_const_tags_context } from './shared/add_const_tags';

export default class SlotTemplateWrapper extends Wrapper {
	node: SlotTemplate;
	fragment: FragmentWrapper;
	block: Block;
	parent: InlineComponentWrapper;

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
		this.parent.node.lets.forEach(l => {
			if (!seen.has(l.name.name)) lets.push(l);
		});

		this.parent.set_slot(
			slot_template_name,
			get_slot_definition(this.block, scope, lets)
		);

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

	render() {
		this.fragment.render(this.block, null, x`#nodes` as Identifier);

		if (this.node.const_tags.length > 0) {
			this.render_get_context();
		}
	}
	render_get_context() {
		const get_context = this.block.renderer.component.get_unique_name('get_context');
		this.block.renderer.blocks.push(b`
			function ${get_context}(#ctx) {
				${add_const_tags(this.block, this.node.const_tags, '#ctx')}
			}
		`);
		this.block.chunks.declarations.push(b`${get_context}(#ctx)`);
		if (this.block.has_update_method) {
			this.block.chunks.update.unshift(b`${get_context}(#ctx)`);
		}
	}
}
