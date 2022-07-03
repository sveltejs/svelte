import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import { Identifier } from 'estree';
import { push_array } from '../../../utils/push_array';
import ConditionalBlockBranch from './shared/ConditionalBlockBranch';
import SwitchBlock from '../../nodes/SwitchBlock';
import CaseBlock from '../../nodes/CaseBlock';
import Expression from '../../nodes/shared/Expression';
import ConditionalBlockWrapper from './shared/ConditionalBlockWrapper';

export default class SwitchBlockWrapper extends ConditionalBlockWrapper {
	node: SwitchBlock;
	branches: ConditionalBlockBranch[];
	discriminant: Expression;
	needs_update = false;

	var: Identifier = { type: 'Identifier', name: 'switch_block' };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: SwitchBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.discriminant = node.discriminant;

		const blocks: Block[] = [];
		let is_dynamic = false;
		let has_intros = false;
		let has_outros = false;

		const create_branches = (node: CaseBlock) => {
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

			if (node.is_default) {
block.add_dependencies(this.node.discriminant.dependencies);
} else block.add_dependencies(node.test.dependencies);

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
		};

		this.node.cases.forEach((c) => create_branches(c));

		// the default statement is first in the markup
		// but logically we want it to be last
		if ((this.branches[0].node as CaseBlock).is_default) {
			const [default_case] = this.branches.splice(0, 1);
			this.branches.push(default_case);
		}

		blocks.forEach((block) => {
			block.has_update_method = is_dynamic;
			block.has_intro_method = has_intros;
			block.has_outro_method = has_outros;
		});

		push_array(renderer.blocks, blocks);
	}
}
