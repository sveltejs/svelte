import deindent from '../../utils/deindent';
import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import createDebuggingComment from '../../utils/createDebuggingComment';

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
	else: ElseBlock;

	block: Block;

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		const { generator } = this;

		this.cannotUseInnerHTML();

		const blocks: Block[] = [];
		let dynamic = false;
		let hasIntros = false;
		let hasOutros = false;

		function attachBlocks(node: IfBlock) {
			node.var = block.getUniqueName(`if_block`);

			block.addDependencies(node.metadata.dependencies);

			node.block = block.child({
				comment: createDebuggingComment(node, generator),
				name: generator.getUniqueName(`create_if_block`),
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
					comment: createDebuggingComment(node.else, generator),
					name: generator.getUniqueName(`create_if_block`),
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

		generator.blocks.push(...blocks);
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

		const branches = getBranches(this.generator, block, parentNode, parentNodes, this);

		const hasElse = isElseBranch(branches[branches.length - 1]);
		const if_name = hasElse ? '' : `if (${name}) `;

		const dynamic = branches[0].hasUpdateMethod; // can use [0] as proxy for all, since they necessarily have the same value
		const hasOutros = branches[0].hasOutroMethod;

		const vars = { name, anchor, if_name, hasElse };

		if (this.else) {
			if (hasOutros) {
				compoundWithOutros(
					this.generator,
					block,
					parentNode,
					parentNodes,
					this,
					branches,
					dynamic,
					vars
				);
			} else {
				compound(this.generator, block, parentNode, parentNodes, this, branches, dynamic, vars);
			}
		} else {
			simple(this.generator, block, parentNode, parentNodes, this, branches[0], dynamic, vars);
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
}





// TODO move all this into the class

function getBranches(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
	parentNodes: string,
	node: Node
) {
	block.contextualise(node.expression); // TODO remove

	const branches = [
		{
			condition: node.metadata.snippet,
			block: node.block.name,
			hasUpdateMethod: node.block.hasUpdateMethod,
			hasIntroMethod: node.block.hasIntroMethod,
			hasOutroMethod: node.block.hasOutroMethod,
		},
	];

	visitChildren(generator, block, node);

	if (isElseIf(node.else)) {
		branches.push(
			...getBranches(generator, block, parentNode, parentNodes, node.else.children[0])
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
			visitChildren(generator, block, node.else);
		}
	}

	return branches;
}

function visitChildren(
	generator: DomGenerator,
	block: Block,
	node: Node
) {
	node.children.forEach((child: Node) => {
		child.build(node.block, null, 'nodes');
	});
}



function simple(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
	parentNodes: string,
	node: Node,
	branch,
	dynamic,
	{ name, anchor, if_name }
) {
	block.builders.init.addBlock(deindent`
		var ${name} = (${branch.condition}) && ${branch.block}(#component, state);
	`);

	const mountOrIntro = branch.hasIntroMethod ? 'i' : 'm';
	const initialMountNode = parentNode || '#target';
	const anchorNode = parentNode ? 'null' : 'anchor';

	block.builders.mount.addLine(
		`if (${name}) ${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
	);

	const updateMountNode = node.getUpdateMountNode(anchor);

	const enter = dynamic
		? branch.hasIntroMethod
			? deindent`
				if (${name}) {
					${name}.p(changed, state);
				} else {
					${name} = ${branch.block}(#component, state);
					if (${name}) ${name}.c();
				}

				${name}.i(${updateMountNode}, ${anchor});
			`
			: deindent`
				if (${name}) {
					${name}.p(changed, state);
				} else {
					${name} = ${branch.block}(#component, state);
					${name}.c();
					${name}.m(${updateMountNode}, ${anchor});
				}
			`
		: branch.hasIntroMethod
			? deindent`
				if (!${name}) {
					${name} = ${branch.block}(#component, state);
					${name}.c();
				}
				${name}.i(${updateMountNode}, ${anchor});
			`
			: deindent`
				if (!${name}) {
					${name} = ${branch.block}(#component, state);
					${name}.c();
					${name}.m(${updateMountNode}, ${anchor});
				}
			`;

	// no `p()` here — we don't want to update outroing nodes,
	// as that will typically result in glitching
	const exit = branch.hasOutroMethod
		? deindent`
			${name}.o(function() {
				${name}.u();
				${name}.d();
				${name} = null;
			});
		`
		: deindent`
			${name}.u();
			${name}.d();
			${name} = null;
		`;

	block.builders.update.addBlock(deindent`
		if (${branch.condition}) {
			${enter}
		} else if (${name}) {
			${exit}
		}
	`);

	block.builders.unmount.addLine(`${if_name}${name}.u();`);

	block.builders.destroy.addLine(`${if_name}${name}.d();`);
}

function compound(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
		parentNodes: string,
	node: Node,
	branches,
	dynamic,
	{ name, anchor, hasElse, if_name }
) {
	const select_block_type = generator.getUniqueName(`select_block_type`);
	const current_block_type = block.getUniqueName(`current_block_type`);
	const current_block_type_and = hasElse ? '' : `${current_block_type} && `;

	block.builders.init.addBlock(deindent`
		function ${select_block_type}(state) {
			${branches
				.map(({ condition, block }) => `${condition ? `if (${condition}) ` : ''}return ${block};`)
				.join('\n')}
		}
		var ${current_block_type} = ${select_block_type}(state);
		var ${name} = ${current_block_type_and}${current_block_type}(#component, state);
	`);

	const mountOrIntro = branches[0].hasIntroMethod ? 'i' : 'm';

	const initialMountNode = parentNode || '#target';
	const anchorNode = parentNode ? 'null' : 'anchor';
	block.builders.mount.addLine(
		`${if_name}${name}.${mountOrIntro}(${initialMountNode}, ${anchorNode});`
	);

	const updateMountNode = node.getUpdateMountNode(anchor);

	const changeBlock = deindent`
		${hasElse
			? deindent`
				${name}.u();
				${name}.d();
			`
			: deindent`
				if (${name}) {
					${name}.u();
					${name}.d();
				}`}
		${name} = ${current_block_type_and}${current_block_type}(#component, state);
		${if_name}${name}.c();
		${if_name}${name}.${mountOrIntro}(${updateMountNode}, ${anchor});
	`;

	if (dynamic) {
		block.builders.update.addBlock(deindent`
			if (${current_block_type} === (${current_block_type} = ${select_block_type}(state)) && ${name}) {
				${name}.p(changed, state);
			} else {
				${changeBlock}
			}
		`);
	} else {
		block.builders.update.addBlock(deindent`
			if (${current_block_type} !== (${current_block_type} = ${select_block_type}(state))) {
				${changeBlock}
			}
		`);
	}

	block.builders.unmount.addLine(`${if_name}${name}.u();`);

	block.builders.destroy.addLine(`${if_name}${name}.d();`);
}

// if any of the siblings have outros, we need to keep references to the blocks
// (TODO does this only apply to bidi transitions?)
function compoundWithOutros(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
	parentNodes: string,
	node: Node,
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

		function ${select_block_type}(state) {
			${branches
				.map(({ condition, block }, i) => `${condition ? `if (${condition}) ` : ''}return ${block ? i : -1};`)
				.join('\n')}
		}
	`);

	if (hasElse) {
		block.builders.init.addBlock(deindent`
			${current_block_type_index} = ${select_block_type}(state);
			${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, state);
		`);
	} else {
		block.builders.init.addBlock(deindent`
			if (~(${current_block_type_index} = ${select_block_type}(state))) {
				${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, state);
			}
		`);
	}

	const mountOrIntro = branches[0].hasIntroMethod ? 'i' : 'm';
	const initialMountNode = parentNode || '#target';
	const anchorNode = parentNode ? 'null' : 'anchor';

	block.builders.mount.addLine(
		`${if_current_block_type_index}${if_blocks}[${current_block_type_index}].${mountOrIntro}(${initialMountNode}, ${anchorNode});`
	);

	const updateMountNode = node.getUpdateMountNode(anchor);

	const destroyOldBlock = deindent`
		${name}.o(function() {
			${if_blocks}[ ${previous_block_index} ].u();
			${if_blocks}[ ${previous_block_index} ].d();
			${if_blocks}[ ${previous_block_index} ] = null;
		});
	`;

	const createNewBlock = deindent`
		${name} = ${if_blocks}[${current_block_type_index}];
		if (!${name}) {
			${name} = ${if_blocks}[${current_block_type_index}] = ${if_block_creators}[${current_block_type_index}](#component, state);
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
			${current_block_type_index} = ${select_block_type}(state);
			if (${current_block_type_index} === ${previous_block_index}) {
				${if_current_block_type_index}${if_blocks}[${current_block_type_index}].p(changed, state);
			} else {
				${changeBlock}
			}
		`);
	} else {
		block.builders.update.addBlock(deindent`
			var ${previous_block_index} = ${current_block_type_index};
			${current_block_type_index} = ${select_block_type}(state);
			if (${current_block_type_index} !== ${previous_block_index}) {
				${changeBlock}
			}
		`);
	}

	block.builders.destroy.addLine(deindent`
		${if_current_block_type_index}{
			${if_blocks}[${current_block_type_index}].u();
			${if_blocks}[${current_block_type_index}].d();
		}
	`);
}