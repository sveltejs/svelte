import deindent from '../../utils/deindent';
import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import Compiler from '../Compiler';
import Block from '../dom/Block';
import createDebuggingComment from '../../utils/createDebuggingComment';
import Expression from './shared/Expression';
import mapChildren from './shared/mapChildren';

function isElseIf(node: ElseBlock) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

function isElseBranch(branch) {
	return branch.block && !branch.condition;
}

export default class IfBlock extends Node {
	type: 'IfBlock';
	expression: Expression;
	children: any[];
	else: ElseBlock;

	block: Block;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.expression = new Expression(compiler, this, scope, info.expression);
		this.children = mapChildren(compiler, this, scope, info.children);

		this.else = info.else
			? new ElseBlock(compiler, this, scope, info.else)
			: null;
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		const { compiler } = this;

		this.cannotUseInnerHTML();

		const blocks: Block[] = [];
		let dynamic = false;
		let hasIntros = false;
		let hasOutros = false;

		function attachBlocks(node: IfBlock) {
			node.var = block.getUniqueName(`if_block`);

			block.addDependencies(node.expression.dependencies);

			node.block = block.child({
				comment: createDebuggingComment(node, compiler),
				name: compiler.getUniqueName(`create_if_block`),
			});

			blocks.push(node.block);
			node.initChildren(node.block, stripWhitespace, nextSibling);

			if (node.block.dependencies.size > 0) {
				dynamic = true;
				block.addDependencies(node.block.dependencies);
			}

			if (node.block.hasIntroMethod) hasIntros = true;
			if (node.block.hasOutroMethod) hasOutros = true;

			if (isElseIf(node.else)) {
				attachBlocks(node.else.children[0]);
			} else if (node.else) {
				node.else.block = block.child({
					comment: createDebuggingComment(node.else, compiler),
					name: compiler.getUniqueName(`create_if_block`),
				});

				blocks.push(node.else.block);
				node.else.initChildren(
					node.else.block,
					stripWhitespace,
					nextSibling
				);

				if (node.else.block.dependencies.size > 0) {
					dynamic = true;
					block.addDependencies(node.else.block.dependencies);
				}
			}
		}

		attachBlocks(this);

		blocks.forEach(block => {
			block.hasUpdateMethod = dynamic;
			block.hasIntroMethod = hasIntros;
			block.hasOutroMethod = hasOutros;
		});

		compiler.target.blocks.push(...blocks);
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const name = this.var;

		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${name}_anchor`)
			: (this.next && this.next.var) || 'null';

		const branches = this.getBranches(block, parentNode, parentNodes, this);

		const hasElse = isElseBranch(branches[branches.length - 1]);
		const if_name = hasElse ? '' : `if (${name}) `;

		const dynamic = branches[0].hasUpdateMethod; // can use [0] as proxy for all, since they necessarily have the same value
		const hasOutros = branches[0].hasOutroMethod;

		const vars = { name, anchor, if_name, hasElse };

		if (this.else) {
			if (hasOutros) {
				this.buildCompoundWithOutros(block, parentNode, parentNodes, branches, dynamic, vars);
			} else {
				this.buildCompound(block, parentNode, parentNodes, branches, dynamic, vars);
			}
		} else {
			this.buildSimple(block, parentNode, parentNodes, branches[0], dynamic, vars);
		}

		block.builders.create.addLine(`${if_name}${name}.c();`);

		if (parentNodes) {
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
	}

	buildCompound(
		block: Block,
		parentNode: string,
		parentNodes: string,
		branches,
		dynamic,
		{ name, anchor, hasElse, if_name }
	) {
		const select_block_type = this.compiler.getUniqueName(`select_block_type`);
		const current_block_type = block.getUniqueName(`current_block_type`);
		const current_block_type_and = hasElse ? '' : `${current_block_type} && `;

		block.builders.init.addBlock(deindent`
			function ${select_block_type}(ctx) {
				${branches
					.map(({ condition, block }) => `${condition ? `if (${condition}) ` : ''}return ${block};`)
					.join('\n')}
			}
		`);

		block.builders.init.addBlock(deindent`
			var ${current_block_type} = ${select_block_type}(ctx);
			var ${name} = ${current_block_type_and}${current_block_type}(#component, ctx);
		`);

		const mountOrIntro = branches[0].hasIntroMethod ? 'i' : 'm';

		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';
		block.builders.mount.addLine(
			`${if_name}${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const changeBlock = deindent`
			${hasElse
				? deindent`
					${name}.d(1);
				`
				: deindent`
					if (${name}) {
						${name}.d(1);
					}`}
			${name} = ${current_block_type_and}${current_block_type}(#component, ctx);
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
	buildCompoundWithOutros(
		block: Block,
		parentNode: string,
		parentNodes: string,
		branches,
		dynamic,
		{ name, anchor, hasElse }
	) {
		const select_block_type = block.getUniqueName(`select_block_type`);
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
				${branches.map(branch => branch.block).join(',\n')}
			];

			var ${if_blocks} = [];

			function ${select_block_type}(ctx) {
				${branches
					.map(({ condition, block }, i) => `${condition ? `if (${condition}) ` : ''}return ${block ? i : -1};`)
					.join('\n')}
			}
		`);

		if (hasElse) {
			block.builders.init.addBlock(deindent`
				${current_block_type_index} = ${select_block_type}(ctx);
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, ctx);
			`);
		} else {
			block.builders.init.addBlock(deindent`
				if (~(${current_block_type_index} = ${select_block_type}(ctx))) {
					${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, ctx);
				}
			`);
		}

		const mountOrIntro = branches[0].hasIntroMethod ? 'i' : 'm';
		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.mount.addLine(
			`${if_current_block_type_index}${if_blocks}[${current_block_type_index}].${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const destroyOldBlock = deindent`
			@transitionManager.groupOutros();
			${name}.o(function() {
				${if_blocks}[ ${previous_block_index} ].d(1);
				${if_blocks}[ ${previous_block_index} ] = null;
			});
		`;

		const createNewBlock = deindent`
			${name} = ${if_blocks}[${current_block_type_index}];
			if (!${name}) {
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, ctx);
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
			${if_current_block_type_index}{
				${if_blocks}[${current_block_type_index}].d(${parentNode ? '' : 'detach'});
			}
		`);
	}

	buildSimple(
		block: Block,
		parentNode: string,
		parentNodes: string,
		branch,
		dynamic,
		{ name, anchor, if_name }
	) {
		block.builders.init.addBlock(deindent`
			var ${name} = (${branch.condition}) && ${branch.block}(#component, ctx);
		`);

		const mountOrIntro = branch.hasIntroMethod ? 'i' : 'm';
		const initialMountNode = parentNode || '#target';
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.mount.addLine(
			`if (${name}) ${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
		);

		const updateMountNode = this.getUpdateMountNode(anchor);

		const enter = dynamic
			? (branch.hasIntroMethod || branch.hasOutroMethod)
				? deindent`
					if (${name}) {
						${name}.p(changed, ctx);
					} else {
						${name} = ${branch.block}(#component, ctx);
						if (${name}) ${name}.c();
					}

					${name}.i(${updateMountNode}, ${anchor});
				`
				: deindent`
					if (${name}) {
						${name}.p(changed, ctx);
					} else {
						${name} = ${branch.block}(#component, ctx);
						${name}.c();
						${name}.m(${updateMountNode}, ${anchor});
					}
				`
			: (branch.hasIntroMethod || branch.hasOutroMethod)
				? deindent`
					if (!${name}) {
						${name} = ${branch.block}(#component, ctx);
						${name}.c();
					}
					${name}.i(${updateMountNode}, ${anchor});
				`
				: deindent`
					if (!${name}) {
						${name} = ${branch.block}(#component, ctx);
						${name}.c();
						${name}.m(${updateMountNode}, ${anchor});
					}
				`;

		// no `p()` here — we don't want to update outroing nodes,
		// as that will typically result in glitching
		const exit = branch.hasOutroMethod
			? deindent`
				@transitionManager.groupOutros();
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

	getBranches(
		block: Block,
		parentNode: string,
		parentNodes: string,
		node: IfBlock
	) {
		const branches = [
			{
				condition: node.expression.snippet,
				block: node.block.name,
				hasUpdateMethod: node.block.hasUpdateMethod,
				hasIntroMethod: node.block.hasIntroMethod,
				hasOutroMethod: node.block.hasOutroMethod,
			},
		];

		this.visitChildren(block, node);

		if (isElseIf(node.else)) {
			branches.push(
				...this.getBranches(block, parentNode, parentNodes, node.else.children[0])
			);
		} else {
			branches.push({
				condition: null,
				block: node.else ? node.else.block.name : null,
				hasUpdateMethod: node.else ? node.else.block.hasUpdateMethod : false,
				hasIntroMethod: node.else ? node.else.block.hasIntroMethod : false,
				hasOutroMethod: node.else ? node.else.block.hasOutroMethod : false,
			});

			if (node.else) {
				this.visitChildren(block, node.else);
			}
		}

		return branches;
	}

	ssr() {
		const { compiler } = this;
		const { snippet } = this.expression;

		compiler.target.append('${ ' + snippet + ' ? `');

		this.children.forEach((child: Node) => {
			child.ssr();
		});

		compiler.target.append('` : `');

		if (this.else) {
			this.else.children.forEach((child: Node) => {
				child.ssr();
			});
		}

		compiler.target.append('` }');
	}

	visitChildren(block: Block, node: Node) {
		node.children.forEach((child: Node) => {
			child.build(node.block, null, 'nodes');
		});
	}
}