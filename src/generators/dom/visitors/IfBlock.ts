import deindent from '../../../utils/deindent';
import visit from '../visit';
import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

function isElseIf(node: Node) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

function isElseBranch(branch) {
	return branch.block && !branch.condition;
}

function getBranches(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	const branches = [
		{
			condition: block.contextualise(node.expression).snippet,
			block: node._block.name,
			hasUpdateMethod: node._block.hasUpdateMethod,
			hasIntroMethod: node._block.hasIntroMethod,
			hasOutroMethod: node._block.hasOutroMethod,
		},
	];

	visitChildren(generator, block, state, node, elementStack);

	if (isElseIf(node.else)) {
		branches.push(
			...getBranches(generator, block, state, node.else.children[0], elementStack)
		);
	} else {
		branches.push({
			condition: null,
			block: node.else ? node.else._block.name : null,
			hasUpdateMethod: node.else ? node.else._block.hasUpdateMethod : false,
			hasIntroMethod: node.else ? node.else._block.hasIntroMethod : false,
			hasOutroMethod: node.else ? node.else._block.hasOutroMethod : false,
		});

		if (node.else) {
			visitChildren(generator, block, state, node.else, elementStack);
		}
	}

	return branches;
}

function visitChildren(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	node.children.forEach((child: Node) => {
		visit(generator, node._block, node._state, child, elementStack);
	});
}

export default function visitIfBlock(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	const name = generator.getUniqueName(`if_block`);
	const anchor = node.needsAnchor
		? block.getUniqueName(`${name}_anchor`)
		: (node.next && node.next._state.name) || 'null';
	const params = block.params.join(', ');

	const branches = getBranches(generator, block, state, node, elementStack);

	const hasElse = isElseBranch(branches[branches.length - 1]);
	const if_name = hasElse ? '' : `if ( ${name} ) `;

	const dynamic = branches[0].hasUpdateMethod; // can use [0] as proxy for all, since they necessarily have the same value
	const hasOutros = branches[0].hasOutroMethod;

	const vars = { name, anchor, params, if_name, hasElse };

	if (node.else) {
		if (hasOutros) {
			compoundWithOutros(
				generator,
				block,
				state,
				node,
				branches,
				dynamic,
				vars
			);
		} else {
			compound(generator, block, state, node, branches, dynamic, vars);
		}
	} else {
		simple(generator, block, state, node, branches[0], dynamic, vars);
	}

	block.builders.create.addLine(`${if_name}${name}.create();`);

	block.builders.claim.addLine(
		`${if_name}${name}.claim( ${state.parentNodes} );`
	);

	if (node.needsAnchor) {
		block.addElement(
			anchor,
			`@createComment()`,
			`@createComment()`,
			state.parentNode
		);
	} else if (node.next) {
		node.next.usedAsAnchor = true;
	}
}

function simple(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	branch,
	dynamic,
	{ name, anchor, params, if_name }
) {
	block.builders.init.addBlock(deindent`
		var ${name} = (${branch.condition}) && ${branch.block}( ${params}, #component );
	`);

	const isTopLevel = !state.parentNode;
	const mountOrIntro = branch.hasIntroMethod ? 'intro' : 'mount';
	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.mount.addLine(
		`if ( ${name} ) ${name}.${mountOrIntro}( ${targetNode}, ${anchorNode} );`
	);

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	const enter = dynamic
		? branch.hasIntroMethod
			? deindent`
				if ( ${name} ) {
					${name}.update( changed, ${params} );
				} else {
					${name} = ${branch.block}( ${params}, #component );
					if ( ${name} ) ${name}.create();
				}

				${name}.intro( ${parentNode}, ${anchor} );
			`
			: deindent`
				if ( ${name} ) {
					${name}.update( changed, ${params} );
				} else {
					${name} = ${branch.block}( ${params}, #component );
					${name}.create();
					${name}.mount( ${parentNode}, ${anchor} );
				}
			`
		: branch.hasIntroMethod
			? deindent`
				if ( !${name} ) {
					${name} = ${branch.block}( ${params}, #component );
					${name}.create();
				}
				${name}.intro( ${parentNode}, ${anchor} );
			`
			: deindent`
				if ( !${name} ) {
					${name} = ${branch.block}( ${params}, #component );
					${name}.create();
					${name}.mount( ${parentNode}, ${anchor} );
				}
			`;

	// no `update()` here — we don't want to update outroing nodes,
	// as that will typically result in glitching
	const exit = branch.hasOutroMethod
		? deindent`
			${name}.outro( function () {
				${name}.unmount();
				${name}.destroy();
				${name} = null;
			});
		`
		: deindent`
			${name}.unmount();
			${name}.destroy();
			${name} = null;
		`;

	block.builders.update.addBlock(deindent`
		if ( ${branch.condition} ) {
			${enter}
		} else if ( ${name} ) {
			${exit}
		}
	`);

	block.builders.unmount.addLine(`${if_name}${name}.unmount();`);

	block.builders.destroy.addLine(`${if_name}${name}.destroy();`);
}

function compound(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	branches,
	dynamic,
	{ name, anchor, params, hasElse, if_name }
) {
	const select_block_type = generator.getUniqueName(`select_block_type`);
	const current_block_type = block.getUniqueName(`current_block_type`);
	const current_block_type_and = hasElse ? '' : `${current_block_type} && `;

	generator.blocks.push(deindent`
		function ${select_block_type} ( ${params} ) {
			${branches
				.map(({ condition, block }) => {
					return `${condition ? `if ( ${condition} ) ` : ''}return ${block};`;
				})
				.join('\n')}
		}
	`);

	block.builders.init.addBlock(deindent`
		var ${current_block_type} = ${select_block_type}( ${params} );
		var ${name} = ${current_block_type_and}${current_block_type}( ${params}, #component );
	`);

	const isTopLevel = !state.parentNode;
	const mountOrIntro = branches[0].hasIntroMethod ? 'intro' : 'mount';

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';
	block.builders.mount.addLine(
		`${if_name}${name}.${mountOrIntro}( ${targetNode}, ${anchorNode} );`
	);

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	const changeBlock = deindent`
		${hasElse
			? deindent`
				${name}.unmount();
				${name}.destroy();
			`
			: deindent`
				if ( ${name} ) {
					${name}.unmount();
					${name}.destroy();
				}`}
		${name} = ${current_block_type_and}${current_block_type}( ${params}, #component );
		${if_name}${name}.create();
		${if_name}${name}.${mountOrIntro}( ${parentNode}, ${anchor} );
	`;

	if (dynamic) {
		block.builders.update.addBlock(deindent`
			if ( ${current_block_type} === ( ${current_block_type} = ${select_block_type}( ${params} ) ) && ${name} ) {
				${name}.update( changed, ${params} );
			} else {
				${changeBlock}
			}
		`);
	} else {
		block.builders.update.addBlock(deindent`
			if ( ${current_block_type} !== ( ${current_block_type} = ${select_block_type}( ${params} ) ) ) {
				${changeBlock}
			}
		`);
	}

	block.builders.unmount.addLine(`${if_name}${name}.unmount();`);

	block.builders.destroy.addLine(`${if_name}${name}.destroy();`);
}

// if any of the siblings have outros, we need to keep references to the blocks
// (TODO does this only apply to bidi transitions?)
function compoundWithOutros(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	branches,
	dynamic,
	{ name, anchor, params, hasElse }
) {
	const select_block_type = block.getUniqueName(`select_block_type`);
	const current_block_type_index = block.getUniqueName(`current_block_type_index`);
	const previous_block_index = block.getUniqueName(`previous_block_index`);
	const if_block_creators = block.getUniqueName(`if_block_creators`);
	const if_blocks = block.getUniqueName(`if_blocks`);

	const if_current_block_type_index = hasElse
		? ''
		: `if ( ~${current_block_type_index} ) `;

	block.addVariable(current_block_type_index);
	block.addVariable(name);

	block.builders.init.addBlock(deindent`
		var ${if_block_creators} = [
			${branches.map(branch => branch.block).join(',\n')}
		];

		var ${if_blocks} = [];

		function ${select_block_type} ( ${params} ) {
			${branches
				.map(({ condition, block }, i) => {
					return `${condition ? `if ( ${condition} ) ` : ''}return ${block
						? i
						: -1};`;
				})
				.join('\n')}
		}
	`);

	if (hasElse) {
		block.builders.init.addBlock(deindent`
			${current_block_type_index} = ${select_block_type}( ${params} );
			${name} = ${if_blocks}[ ${current_block_type_index} ] = ${if_block_creators}[ ${current_block_type_index} ]( ${params}, #component );
		`);
	} else {
		block.builders.init.addBlock(deindent`
			if ( ~( ${current_block_type_index} = ${select_block_type}( ${params} ) ) ) {
				${name} = ${if_blocks}[ ${current_block_type_index} ] = ${if_block_creators}[ ${current_block_type_index} ]( ${params}, #component );
			}
		`);
	}

	const isTopLevel = !state.parentNode;
	const mountOrIntro = branches[0].hasIntroMethod ? 'intro' : 'mount';
	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.mount.addLine(
		`${if_current_block_type_index}${if_blocks}[ ${current_block_type_index} ].${mountOrIntro}( ${targetNode}, ${anchorNode} );`
	);

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	const destroyOldBlock = deindent`
		${name}.outro( function () {
			${if_blocks}[ ${previous_block_index} ].unmount();
			${if_blocks}[ ${previous_block_index} ].destroy();
			${if_blocks}[ ${previous_block_index} ] = null;
		});
	`;

	const createNewBlock = deindent`
		${name} = ${if_blocks}[ ${current_block_type_index} ];
		if ( !${name} ) {
			${name} = ${if_blocks}[ ${current_block_type_index} ] = ${if_block_creators}[ ${current_block_type_index} ]( ${params}, #component );
			${name}.create();
		}
		${name}.${mountOrIntro}( ${parentNode}, ${anchor} );
	`;

	const changeBlock = hasElse
		? deindent`
			${destroyOldBlock}

			${createNewBlock}
		`
		: deindent`
			if ( ${name} ) {
				${destroyOldBlock}
			}

			if ( ~${current_block_type_index} ) {
				${createNewBlock}
			} else {
				${name} = null;
			}
		`;

	if (dynamic) {
		block.builders.update.addBlock(deindent`
			var ${previous_block_index} = ${current_block_type_index};
			${current_block_type_index} = ${select_block_type}( ${params} );
			if ( ${current_block_type_index} === ${previous_block_index} ) {
				${if_current_block_type_index}${if_blocks}[ ${current_block_type_index} ].update( changed, ${params} );
			} else {
				${changeBlock}
			}
		`);
	} else {
		block.builders.update.addBlock(deindent`
			var ${previous_block_index} = ${current_block_type_index};
			${current_block_type_index} = ${select_block_type}( ${params} );
			if ( ${current_block_type_index} !== ${previous_block_index} ) {
				${changeBlock}
			}
		`);
	}

	block.builders.destroy.addLine(deindent`
		${if_current_block_type_index}{
			${if_blocks}[ ${current_block_type_index} ].unmount();
			${if_blocks}[ ${current_block_type_index} ].destroy();
		}
	`);
}
