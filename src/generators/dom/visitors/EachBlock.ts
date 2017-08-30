import deindent from '../../../utils/deindent';
import visit from '../visit';
import { DomGenerator } from '../index';
import Block from '../Block';
import isDomNode from './shared/isDomNode';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitEachBlock(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) {
	const each_block = generator.getUniqueName(`each_block`);
	const create_each_block = node._block.name;
	const each_block_value = node._block.listName;
	const iterations = block.getUniqueName(`${each_block}_iterations`);
	const params = block.params.join(', ');

	const needsAnchor = node.next ? !isDomNode(node.next) : !state.parentNode;
	const anchor = needsAnchor
		? block.getUniqueName(`${each_block}_anchor`)
		: (node.next && node.next.var) || 'null';

	// hack the sourcemap, so that if data is missing the bug
	// is easy to find
	let c = node.start + 3;
	while (generator.source[c] !== 'e') c += 1;
	generator.code.overwrite(c, c + 4, 'length');
	const length = `[✂${c}-${c+4}✂]`;

	const mountOrIntro = node._block.hasIntroMethod ? 'intro' : 'mount';
	const vars = {
		each_block,
		create_each_block,
		each_block_value,
		length,
		iterations,
		params,
		anchor,
		mountOrIntro,
	};

	const { snippet } = block.contextualise(node.expression);

	block.builders.init.addLine(`var ${each_block_value} = ${snippet};`);

	if (node.key) {
		keyed(generator, block, state, node, snippet, vars);
	} else {
		unkeyed(generator, block, state, node, snippet, vars);
	}

	const isToplevel = !state.parentNode;

	if (needsAnchor) {
		block.addElement(
			anchor,
			`@createComment()`,
			`@createComment()`,
			state.parentNode
		);
	}

	if (node.else) {
		const each_block_else = generator.getUniqueName(`${each_block}_else`);

		block.builders.init.addLine(`var ${each_block_else} = null;`);

		// TODO neaten this up... will end up with an empty line in the block
		block.builders.init.addBlock(deindent`
			if ( !${each_block_value}.${length} ) {
				${each_block_else} = ${node.else._block.name}( ${params}, #component );
				${each_block_else}.create();
			}
		`);

		block.builders.mount.addBlock(deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.${mountOrIntro}( ${state.parentNode ||
			'#target'}, null );
			}
		`);

		const parentNode = state.parentNode || `${anchor}.parentNode`;

		if (node.else._block.hasUpdateMethod) {
			block.builders.update.addBlock(deindent`
				if ( !${each_block_value}.${length} && ${each_block_else} ) {
					${each_block_else}.update( changed, ${params} );
				} else if ( !${each_block_value}.${length} ) {
					${each_block_else} = ${node.else._block.name}( ${params}, #component );
					${each_block_else}.create();
					${each_block_else}.${mountOrIntro}( ${parentNode}, ${anchor} );
				} else if ( ${each_block_else} ) {
					${each_block_else}.unmount();
					${each_block_else}.destroy();
					${each_block_else} = null;
				}
			`);
		} else {
			block.builders.update.addBlock(deindent`
				if ( ${each_block_value}.${length} ) {
					if ( ${each_block_else} ) {
						${each_block_else}.unmount();
						${each_block_else}.destroy();
						${each_block_else} = null;
					}
				} else if ( !${each_block_else} ) {
					${each_block_else} = ${node.else._block.name}( ${params}, #component );
					${each_block_else}.create();
					${each_block_else}.${mountOrIntro}( ${parentNode}, ${anchor} );
				}
			`);
		}

		block.builders.unmount.addLine(
			`if ( ${each_block_else} ) ${each_block_else}.unmount()`
		);

		block.builders.destroy.addBlock(deindent`
			if ( ${each_block_else} ) ${each_block_else}.destroy( false );
		`);
	}

	node.children.forEach((child: Node) => {
		visit(generator, node._block, node._state, child, elementStack, componentStack);
	});

	if (node.else) {
		node.else.children.forEach((child: Node) => {
			visit(generator, node.else._block, node.else._state, child, elementStack, componentStack);
		});
	}
}

function keyed(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	snippet: string,
	{
		each_block,
		create_each_block,
		each_block_value,
		length,
		params,
		anchor,
		mountOrIntro,
	}
) {
	const key = block.getUniqueName('key');
	const lookup = block.getUniqueName(`${each_block}_lookup`);
	const iteration = block.getUniqueName(`${each_block}_iteration`);
	const head = block.getUniqueName(`${each_block}_head`);
	const last = block.getUniqueName(`${each_block}_last`);
	const expected = block.getUniqueName(`${each_block}_expected`);

	block.addVariable(lookup, `Object.create( null )`);
	block.addVariable(head);
	block.addVariable(last);

	if (node.children[0] && node.children[0].type === 'Element' && !generator.components.has(node.children[0].name)) {
		// TODO or text/tag/raw
		node._block.first = node.children[0]._state.parentNode; // TODO this is highly confusing
	} else {
		node._block.first = node._block.getUniqueName('first');
		node._block.addElement(
			node._block.first,
			`@createComment()`,
			`@createComment()`,
			null
		);
	}

	block.builders.init.addBlock(deindent`
		for ( var #i = 0; #i < ${each_block_value}.${length}; #i += 1 ) {
			var ${key} = ${each_block_value}[#i].${node.key};
			var ${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key} );

			if ( ${last} ) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${last} = ${iteration};

			if ( #i === 0 ) ${head} = ${iteration};
		}
	`);

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.create.addBlock(deindent`
		var ${iteration} = ${head};
		while ( ${iteration} ) {
			${iteration}.create();
			${iteration} = ${iteration}.next;
		}
	`);

	block.builders.claim.addBlock(deindent`
		var ${iteration} = ${head};
		while ( ${iteration} ) {
			${iteration}.claim( ${state.parentNodes} );
			${iteration} = ${iteration}.next;
		}
	`);

	block.builders.mount.addBlock(deindent`
		var ${iteration} = ${head};
		while ( ${iteration} ) {
			${iteration}.${mountOrIntro}( ${targetNode}, ${anchorNode} );
			${iteration} = ${iteration}.next;
		}
	`);

	const dynamic = node._block.hasUpdateMethod;
	const parentNode = state.parentNode || `${anchor}.parentNode`;

	let destroy;
	if (node._block.hasOutroMethod) {
		const fn = block.getUniqueName(`${each_block}_outro`);
		block.builders.init.addBlock(deindent`
			function ${fn} ( iteration ) {
				iteration.outro( function () {
					iteration.unmount();
					iteration.destroy();
					${lookup}[iteration.key] = null;
				});
			}
		`);

		destroy = deindent`
			while ( ${expected} ) {
				${fn}( ${expected} );
				${expected} = ${expected}.next;
			}

			for ( #i = 0; #i < discard_pile.length; #i += 1 ) {
				if ( discard_pile[#i].discard ) {
					${fn}( discard_pile[#i] );
				}
			}
		`;
	} else {
		const fn = block.getUniqueName(`${each_block}_destroy`);
		block.builders.init.addBlock(deindent`
			function ${fn} ( iteration ) {
				iteration.unmount();
				iteration.destroy();
				${lookup}[iteration.key] = null;
			}
		`);

		destroy = deindent`
			while ( ${expected} ) {
				${fn}( ${expected} );
				${expected} = ${expected}.next;
			}

			for ( #i = 0; #i < discard_pile.length; #i += 1 ) {
				var ${iteration} = discard_pile[#i];
				if ( ${iteration}.discard ) {
					${fn}( ${iteration} );
				}
			}
		`;
	}

	block.builders.update.addBlock(deindent`
		var ${each_block_value} = ${snippet};

		var ${expected} = ${head};
		var ${last} = null;

		var discard_pile = [];

		for ( #i = 0; #i < ${each_block_value}.${length}; #i += 1 ) {
			var ${key} = ${each_block_value}[#i].${node.key};
			var ${iteration} = ${lookup}[${key}];

			${dynamic &&
				`if ( ${iteration} ) ${iteration}.update( changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i );`}

			if ( ${expected} ) {
				if ( ${key} === ${expected}.key ) {
					${expected} = ${expected}.next;
				} else {
					if ( ${iteration} ) {
						// probably a deletion
						while ( ${expected} && ${expected}.key !== ${key} ) {
							${expected}.discard = true;
							discard_pile.push( ${expected} );
							${expected} = ${expected}.next;
						};

						${expected} = ${expected} && ${expected}.next;
						${iteration}.discard = false;
						${iteration}.last = ${last};

						if (!${expected}) ${iteration}.mount( ${parentNode}, ${anchor} );
					} else {
						// key is being inserted
						${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key} );
						${iteration}.create();
						${iteration}.${mountOrIntro}( ${parentNode}, ${expected}.first );

						${expected}.last = ${iteration};
						${iteration}.next = ${expected};
					}
				}
			} else {
				// we're appending from this point forward
				if ( ${iteration} ) {
					${iteration}.discard = false;
					${iteration}.next = null;
					${iteration}.mount( ${parentNode}, ${anchor} );
				} else {
					${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key} );
					${iteration}.create();
					${iteration}.${mountOrIntro}( ${parentNode}, ${anchor} );
				}
			}

			if ( ${last} ) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${node._block.hasIntroMethod &&
				`${iteration}.intro( ${parentNode}, ${anchor} );`}
			${last} = ${iteration};
		}

		if ( ${last} ) ${last}.next = null;

		${destroy}

		${head} = ${lookup}[${each_block_value}[0] && ${each_block_value}[0].${node.key}];
	`);

	if (!state.parentNode) {
		block.builders.unmount.addBlock(deindent`
			var ${iteration} = ${head};
			while ( ${iteration} ) {
				${iteration}.unmount();
				${iteration} = ${iteration}.next;
			}
		`);
	}

	block.builders.destroy.addBlock(deindent`
		var ${iteration} = ${head};
		while ( ${iteration} ) {
			${iteration}.destroy( false );
			${iteration} = ${iteration}.next;
		}
	`);
}

function unkeyed(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	snippet,
	{
		create_each_block,
		each_block_value,
		length,
		iterations,
		params,
		anchor,
		mountOrIntro,
	}
) {
	block.builders.init.addBlock(deindent`
		var ${iterations} = [];

		for ( var #i = 0; #i < ${each_block_value}.${length}; #i += 1 ) {
			${iterations}[#i] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component );
		}
	`);

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.create.addBlock(deindent`
		for ( var #i = 0; #i < ${iterations}.length; #i += 1 ) {
			${iterations}[#i].create();
		}
	`);

	block.builders.claim.addBlock(deindent`
		for ( var #i = 0; #i < ${iterations}.length; #i += 1 ) {
			${iterations}[#i].claim( ${state.parentNodes} );
		}
	`);

	block.builders.mount.addBlock(deindent`
		for ( var #i = 0; #i < ${iterations}.length; #i += 1 ) {
			${iterations}[#i].${mountOrIntro}( ${targetNode}, ${anchorNode} );
		}
	`);

	const dependencies = block.findDependencies(node.expression);
	const allDependencies = new Set(node._block.dependencies);
	dependencies.forEach((dependency: string) => {
		allDependencies.add(dependency);
	});

	// TODO do this for keyed blocks as well
	const condition = Array.from(allDependencies)
		.map(dependency => `changed.${dependency}`)
		.join(' || ');

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	if (condition !== '') {
		const forLoopBody = node._block.hasUpdateMethod
			? node._block.hasIntroMethod
				? deindent`
					if ( ${iterations}[#i] ) {
						${iterations}[#i].update( changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i );
					} else {
						${iterations}[#i] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component );
						${iterations}[#i].create();
					}
					${iterations}[#i].intro( ${parentNode}, ${anchor} );
				`
				: deindent`
					if ( ${iterations}[#i] ) {
						${iterations}[#i].update( changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i );
					} else {
						${iterations}[#i] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component );
						${iterations}[#i].create();
						${iterations}[#i].mount( ${parentNode}, ${anchor} );
					}
				`
			: deindent`
				${iterations}[#i] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component );
				${iterations}[#i].create();
				${iterations}[#i].${mountOrIntro}( ${parentNode}, ${anchor} );
			`;

		const start = node._block.hasUpdateMethod ? '0' : `${iterations}.length`;

		const outro = block.getUniqueName('outro');
		const destroy = node._block.hasOutroMethod
			? deindent`
				function ${outro} ( i ) {
					if ( ${iterations}[i] ) {
						${iterations}[i].outro( function () {
							${iterations}[i].unmount();
							${iterations}[i].destroy();
							${iterations}[i] = null;
						});
					}
				}

				for ( ; #i < ${iterations}.length; #i += 1 ) ${outro}( #i );
			`
			: deindent`
				for ( ; #i < ${iterations}.length; #i += 1 ) {
					${iterations}[#i].unmount();
					${iterations}[#i].destroy();
				}
				${iterations}.length = ${each_block_value}.${length};
			`;

		block.builders.update.addBlock(deindent`
			var ${each_block_value} = ${snippet};

			if ( ${condition} ) {
				for ( var #i = ${start}; #i < ${each_block_value}.${length}; #i += 1 ) {
					${forLoopBody}
				}

				${destroy}
			}
		`);
	}

	block.builders.unmount.addBlock(deindent`
		for ( var #i = 0; #i < ${iterations}.length; #i += 1 ) {
			${iterations}[#i].unmount();
		}
	`);

	block.builders.destroy.addBlock(`@destroyEach( ${iterations}, false, 0 );`);
}
