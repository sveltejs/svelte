import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import IfBlock from '../../nodes/IfBlock';
import ElseBlock from '../../nodes/ElseBlock';
import { Identifier } from 'estree';
import { push_array } from '../../../utils/push_array';
import ConditionalBlockBranch from './shared/ConditionalBlockBranch';
import ConditionalBlockWrapper from './shared/ConditionalBlock';

function is_else_if(node: ElseBlock) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

export default class IfBlockWrapper extends ConditionalBlockWrapper {
	node: IfBlock;
	branches: ConditionalBlockBranch[];
	needs_update = false;

	var: Identifier = { type: 'Identifier', name: 'if_block' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: IfBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		const blocks: Block[] = [];
		let is_dynamic = false;
		let has_intros = false;
		let has_outros = false;

		const create_branches = (node: IfBlock) => {
			const branch = new ConditionalBlockBranch(
				renderer,
				block,
				this,
				node,
				strip_whitespace,
				next_sibling
			);

			this.branches.push(branch);

			blocks.push(branch.block);
			block.add_dependencies(node.expression.dependencies);

			if (branch.block.dependencies.size > 0) {
				// the condition, or its contents, is dynamic
				is_dynamic = true;
				block.add_dependencies(branch.block.dependencies);
			}

			if (branch.dependencies && branch.dependencies.length > 0) {
				// the condition itself is dynamic
				this.needs_update = true;
			}

			if (branch.block.has_intros) has_intros = true;
			if (branch.block.has_outros) has_outros = true;

			if (is_else_if(node.else)) {
				create_branches(node.else.children[0] as IfBlock);
			} else if (node.else) {
				const branch = new ConditionalBlockBranch(
					renderer,
					block,
					this,
					node.else,
					strip_whitespace,
					next_sibling
				);

				this.branches.push(branch);

				blocks.push(branch.block);

				if (branch.block.dependencies.size > 0) {
					is_dynamic = true;
					block.add_dependencies(branch.block.dependencies);
				}

				if (branch.block.has_intros) has_intros = true;
				if (branch.block.has_outros) has_outros = true;
			}
		};

		create_branches(this.node);

		blocks.forEach(block => {
			block.has_update_method = is_dynamic;
			block.has_intro_method = has_intros;
			block.has_outro_method = has_outros;
		});

		push_array(renderer.blocks, blocks);
	}
}
