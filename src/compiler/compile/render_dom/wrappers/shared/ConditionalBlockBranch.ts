import { walk } from 'estree-walker';
import CaseBlock from '../../../nodes/CaseBlock';
import ElseBlock from '../../../nodes/ElseBlock';
import IfBlock from '../../../nodes/IfBlock';
import Block from '../../Block';
import Renderer from '../../Renderer';
import FragmentWrapper from '../Fragment';
import { add_const_tags_context } from './add_const_tags';
import create_debugging_comment from './create_debugging_comment';
import Wrapper from './Wrapper';
import { Node } from 'estree';
import Expression from '../../../nodes/shared/Expression';
import ConditionalBlockWrapper from './ConditionalBlockWrapper';

function get_expression(node: IfBlock | ElseBlock | CaseBlock): Expression | void {
	switch (node.type) {
		case 'ElseBlock':
			return;

		case 'IfBlock':
			return node.expression;

		case 'CaseBlock':
			if (!node.is_default) return node.test;
	}
}

export default class ConditionalBlockBranch extends Wrapper {
	block: Block;
	fragment: FragmentWrapper;
	dependencies?: string[];
	condition?: any;
	snippet?: Node;
	is_dynamic: boolean;
	node: IfBlock | ElseBlock | CaseBlock;

	var = null;
	get_ctx_name: Node | undefined;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: ConditionalBlockWrapper,
		node: IfBlock | ElseBlock | CaseBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		const expression = get_expression(node);
		const type =
			node.type === 'CaseBlock'
				? 'case'
				: node.type === 'ElseBlock'
				? 'else'
				: 'if';

		if (expression) {
			this.dependencies = expression.dynamic_dependencies();

			// TODO is this the right rule? or should any non-reference count?
			// const should_cache = !is_reference(expression.node, null) && dependencies.length > 0;
			let should_cache = false;
			walk(expression.node, {
				enter(node) {
					if (node.type === 'CallExpression' || node.type === 'NewExpression') {
						should_cache = true;
					}
				}
			});

			if (should_cache) {
				this.condition = block.get_unique_name('conditional_render');
				this.snippet = expression.manipulate(block) as Node;
			} else {
				this.condition = expression.manipulate(block);
			}
		}

		add_const_tags_context(renderer, this.node.const_tags);

		this.block = block.child({
			comment: create_debugging_comment(node, parent.renderer.component),
			name: parent.renderer.component.get_unique_name(
				type === 'case'
					? 'create_case_block'
					: type === 'else'
					? 'create_else_block'
					: 'create_if_block'
			),
			type
		});

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			node.children,
			parent,
			strip_whitespace,
			next_sibling
		);

		this.is_dynamic = this.block.dependencies.size > 0;

		if (node.const_tags.length > 0) {
			this.get_ctx_name = parent.renderer.component.get_unique_name(
				type === 'case'
					? 'get_case_ctx'
					: type === 'else'
					? 'get_else_ctx'
					: 'get_if_ctx'
			);
		}
	}
}
