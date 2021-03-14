import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import FragmentWrapper from './Fragment';
import create_debugging_comment from './shared/create_debugging_comment';
import { get_slot_definition } from './shared/get_slot_definition';
import { x } from 'code-red';
import { sanitize } from '../../../utils/names';
import { Identifier } from 'estree';
import InlineComponentWrapper from './InlineComponent';
import { extract_names } from 'periscopic';
import { INode } from '../../nodes/interfaces';
import Let from '../../nodes/Let';
import TemplateScope from '../../nodes/shared/TemplateScope';

type NodeWithLets = INode & {
	scope: TemplateScope;
	lets: Let[];
	slot_template_name: string;
};

export default class SlotTemplateWrapper extends Wrapper {
	node: NodeWithLets;
	fragment: FragmentWrapper;
	block: Block;
	parent: InlineComponentWrapper;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: NodeWithLets,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		const { scope, lets, slot_template_name } = this.node;

		lets.forEach(l => {
			extract_names(l.value || l.name).forEach(name => {
				renderer.add_to_context(name, true);
			});
		});

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
	}
}
