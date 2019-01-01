import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import EachBlock from '../../nodes/EachBlock';
import IfBlock from '../../nodes/IfBlock';
import createDebuggingComment from '../../../utils/createDebuggingComment';
import ElseBlock from '../../nodes/ElseBlock';
import FragmentWrapper from './Fragment';
import deindent from '../../../utils/deindent';

function isElseIf(node: ElseBlock) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

class IfBlockBranch extends Wrapper {
	block: Block;
	fragment: FragmentWrapper;
	condition: string;
	isDynamic: boolean;

	var = null;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: IfBlockWrapper,
		node: IfBlock | ElseBlock,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.condition = (<IfBlock>node).expression && (<IfBlock>node).expression.render();

		this.block = block.child({
			comment: createDebuggingComment(node, parent.renderer.component),
			name: parent.renderer.component.getUniqueName(
				(<IfBlock>node).expression ? `create_if_block` : `create_else_block`
			)
		});

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, parent, stripWhitespace, nextSibling);

		this.isDynamic = this.block.dependencies.size > 0;
	}
}

export default class IfBlockWrapper extends Wrapper {
	node: IfBlock;
	branches: IfBlockBranch[];

	var = 'if_block';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: EachBlock,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		const { component } = renderer;

		this.cannotUseInnerHTML();

		this.branches = [];

		const blocks: Block[] = [];
		let isDynamic = false;
		let hasIntros = false;
		let hasOutros = false;

		const createBranches = (node: IfBlock) => {
			const branch = new IfBlockBranch(
				renderer,
				block,
				this,
				node,
				stripWhitespace,
				nextSibling
			);

			this.branches.push(branch);

			blocks.push(branch.block);
			block.addDependencies(node.expression.dynamic_dependencies);

			if (branch.block.dependencies.size > 0) {
				isDynamic = true;
				block.addDependencies(branch.block.dependencies);
			}

			if (branch.block.hasIntros) hasIntros = true;
			if (branch.block.hasOutros) hasOutros = true;

			if (isElseIf(node.else)) {
				createBranches(node.else.children[0]);
			} else if (node.else) {
				const branch = new IfBlockBranch(
					renderer,
					block,
					this,
					node.else,
					stripWhitespace,
					nextSibling
				);

				this.branches.push(branch);

				blocks.push(branch.block);

				if (branch.block.dependencies.size > 0) {
					isDynamic = true;
					block.addDependencies(branch.block.dependencies);
				}

				if (branch.block.hasIntros) hasIntros = true;
				if (branch.block.hasOutros) hasOutros = true;
			}
		};

		createBranches(this.node);

		if (hasIntros) block.addIntro();
		if (hasOutros) block.addOutro();

		blocks.forEach(block => {
			block.hasUpdateMethod = isDynamic;
			block.hasIntroMethod = hasIntros;
			block.hasOutroMethod = hasOutros;
		});

		renderer.blocks.push(...blocks);
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const name = this.var;

		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${name}_anchor`)
			: (this.next && this.next.var) || 'null';

		const hasElse = !(this.branches[this.branches.length - 1].condition);
		const if_name = hasElse ? '' : `if (${name}) `;

		const dynamic = this.branches[0].block.hasUpdateMethod; // can use [0] as proxy for all, since they necessarily have the same value
		const hasOutros = this.branches[0].block.hasOutroMethod;

		const vars = { name, anchor, if_name, hasElse };

		if (this.node.else) {
			if (hasOutros) {
				this.renderCompoundWithOutros(block, parentNode, parentNodes, dynamic, vars);

				block.builders.outro.addBlock(deindent`
					if (${name}) ${name}.o(#outrocallback);
					else #outrocallback();
				`);
			} else {
				this.renderCompound(block, parentNode, parentNodes, dynamic, vars);
			}
		} else {
			this.renderSimple(block, parentNode, parentNodes, dynamic, vars);

			if (hasOutros) {
				block.builders.outro.addBlock(deindent`
					if (${name}) ${name}.o(#outrocallback);
					else #outrocallback();
				`);
			}
		}

		block.builders.create.addLine(`${if_name}${name}.c();`);

		if (parentNodes && this.renderer.options.hydratable) {
			block.builders.claim.addLine(
				`${if_name}${name}.l(${parentNodes});`
			);
		}

		if (needsAnchor) {
			block.addElement(
				anchor,
				`@createComment()`,
				parentNodes && `@createComment()`,
				parentNode
			);
		}

		this.branches.forEach(branch => {
			branch.fragment.render(branch.block, null, 'nodes');
		});
	}

	renderCompound(
		block: Block,
		parentNode: string,
		parentNodes: string,
		dynamic,
		{ name, anchor, hasElse, if_name }
	) {
		const select_block_type = this.renderer.component.getUniqueName(`select_block_type`);
		const current_block_type = block.getUniqueName(`current_block_type`);
		const current_block_type_and = hasElse ? '' : `${current_block_type} && `;

		block.builders.init.addBlock(deindent`
			function ${select_block_type}(ctx) {
				${this.branches
					.map(({ condition, block }) => `${condition ? `if (${condition}) ` : ''}return ${block.name};`)
					.join('\n')}
			}
		`);

		block.builders.init.addBlock(deindent`
			var ${current_block_type} = ${select_block_type}(ctx);
			var ${name} = ${current_block_type_and}${current_block_type}($$, ctx);
		`);

		const mountOrIntro = this.branches[0].block.hasIntroMethod ? 'i' : 'm';

		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';
		block.builders.mount.addLine(
			`${if_name}${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const changeBlock = deindent`
			${if_name}${name}.d(1);
			${name} = ${current_block_type_and}${current_block_type}($$, ctx);
			${if_name}${name}.c();
			${if_name}${name}.${mountOrIntro}(${updateMountNode}, ${anchor});
		`;

		if (dynamic) {
			block.builders.update.addBlock(deindent`
				if (${current_block_type} === (${current_block_type} = ${select_block_type}(ctx)) && ${name}) {
					${name}.p(changed, ctx);
				} else {
					${changeBlock}
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				if (${current_block_type} !== (${current_block_type} = ${select_block_type}(ctx))) {
					${changeBlock}
				}
			`);
		}

		block.builders.destroy.addLine(`${if_name}${name}.d(${parentNode ? '' : 'detach'});`);
	}

	// if any of the siblings have outros, we need to keep references to the blocks
	// (TODO does this only apply to bidi transitions?)
	renderCompoundWithOutros(
		block: Block,
		parentNode: string,
		parentNodes: string,
		dynamic,
		{ name, anchor, hasElse }
	) {
		const select_block_type = this.renderer.component.getUniqueName(`select_block_type`);
		const current_block_type_index = block.getUniqueName(`current_block_type_index`);
		const previous_block_index = block.getUniqueName(`previous_block_index`);
		const if_block_creators = block.getUniqueName(`if_block_creators`);
		const if_blocks = block.getUniqueName(`if_blocks`);

		const if_current_block_type_index = hasElse
			? ''
			: `if (~${current_block_type_index}) `;

		block.addVariable(current_block_type_index);
		block.addVariable(name);

		block.builders.init.addBlock(deindent`
			var ${if_block_creators} = [
				${this.branches.map(branch => branch.block.name).join(',\n')}
			];

			var ${if_blocks} = [];

			function ${select_block_type}(ctx) {
				${this.branches
					.map(({ condition }, i) => `${condition ? `if (${condition}) ` : ''}return ${i};`)
					.join('\n')}
				${!hasElse && `return -1;`}
			}
		`);

		if (hasElse) {
			block.builders.init.addBlock(deindent`
				${current_block_type_index} = ${select_block_type}(ctx);
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}]($$, ctx);
			`);
		} else {
			block.builders.init.addBlock(deindent`
				if (~(${current_block_type_index} = ${select_block_type}(ctx))) {
					${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}]($$, ctx);
				}
			`);
		}

		const mountOrIntro = this.branches[0].block.hasIntroMethod ? 'i' : 'm';
		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.mount.addLine(
			`${if_current_block_type_index}${if_blocks}[${current_block_type_index}].${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const destroyOldBlock = deindent`
			@group_outros();
			${name}.o(function() {
				${if_blocks}[${previous_block_index}].d(1);
				${if_blocks}[${previous_block_index}] = null;
			});
		`;

		const createNewBlock = deindent`
			${name} = ${if_blocks}[${current_block_type_index}];
			if (!${name}) {
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}]($$, ctx);
				${name}.c();
			}
			${name}.${mountOrIntro}(${updateMountNode}, ${anchor});
		`;

		const changeBlock = hasElse
			? deindent`
				${destroyOldBlock}

				${createNewBlock}
			`
			: deindent`
				if (${name}) {
					${destroyOldBlock}
				}

				if (~${current_block_type_index}) {
					${createNewBlock}
				} else {
					${name} = null;
				}
			`;

		if (dynamic) {
			block.builders.update.addBlock(deindent`
				var ${previous_block_index} = ${current_block_type_index};
				${current_block_type_index} = ${select_block_type}(ctx);
				if (${current_block_type_index} === ${previous_block_index}) {
					${if_current_block_type_index}${if_blocks}[${current_block_type_index}].p(changed, ctx);
				} else {
					${changeBlock}
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				var ${previous_block_index} = ${current_block_type_index};
				${current_block_type_index} = ${select_block_type}(ctx);
				if (${current_block_type_index} !== ${previous_block_index}) {
					${changeBlock}
				}
			`);
		}

		block.builders.destroy.addLine(deindent`
			${if_current_block_type_index}${if_blocks}[${current_block_type_index}].d(${parentNode ? '' : 'detach'});
		`);
	}

	renderSimple(
		block: Block,
		parentNode: string,
		parentNodes: string,
		dynamic,
		{ name, anchor, if_name }
	) {
		const branch = this.branches[0];

		block.builders.init.addBlock(deindent`
			var ${name} = (${branch.condition}) && ${branch.block.name}($$, ctx);
		`);

		const mountOrIntro = branch.block.hasIntroMethod ? 'i' : 'm';
		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.mount.addLine(
			`if (${name}) ${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const enter = dynamic
			? (branch.block.hasIntroMethod || branch.block.hasOutroMethod)
				? deindent`
					if (${name}) {
						${name}.p(changed, ctx);
					} else {
						${name} = ${branch.block.name}($$, ctx);
						if (${name}) ${name}.c();
					}

					${name}.i(${updateMountNode}, ${anchor});
				`
				: deindent`
					if (${name}) {
						${name}.p(changed, ctx);
					} else {
						${name} = ${branch.block.name}($$, ctx);
						${name}.c();
						${name}.m(${updateMountNode}, ${anchor});
					}
				`
			: (branch.block.hasIntroMethod || branch.block.hasOutroMethod)
				? deindent`
					if (!${name}) {
						${name} = ${branch.block.name}($$, ctx);
						${name}.c();
					}
					${name}.i(${updateMountNode}, ${anchor});
				`
				: deindent`
					if (!${name}) {
						${name} = ${branch.block.name}($$, ctx);
						${name}.c();
						${name}.m(${updateMountNode}, ${anchor});
					}
				`;

		// no `p()` here — we don't want to update outroing nodes,
		// as that will typically result in glitching
		const exit = branch.block.hasOutroMethod
			? deindent`
				@group_outros();
				${name}.o(function() {
					${name}.d(1);
					${name} = null;
				});
			`
			: deindent`
				${name}.d(1);
				${name} = null;
			`;

		block.builders.update.addBlock(deindent`
			if (${branch.condition}) {
				${enter}
			} else if (${name}) {
				${exit}
			}
		`);

		block.builders.destroy.addLine(`${if_name}${name}.d(${parentNode ? '' : 'detach'});`);
	}
}