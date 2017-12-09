import deindent from '../../utils/deindent';
import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import createDebuggingComment from '../../utils/createDebuggingComment';

export default class EachBlock extends Node {
	type: 'EachBlock';

	_block: Block;
	expression: Node;

	iterations: string;
	index: string;
	context: string;
	key: string;
	destructuredContexts: string[];

	children: Node[];
	else?: ElseBlock;

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName(`each`);
		this.iterations = block.getUniqueName(`${this.var}_blocks`);

		const { dependencies } = this.metadata;
		block.addDependencies(dependencies);

		const indexNames = new Map(block.indexNames);
		const indexName =
			this.index || block.getUniqueName(`${this.context}_index`);
		indexNames.set(this.context, indexName);

		const listNames = new Map(block.listNames);
		const listName = block.getUniqueName(
			(this.expression.type === 'MemberExpression' && !this.expression.computed) ? this.expression.property.name :
			this.expression.type === 'Identifier' ? this.expression.name :
			`each_value`
		);
		listNames.set(this.context, listName);

		const context = block.getUniqueName(this.context);
		const contexts = new Map(block.contexts);
		contexts.set(this.context, context);

		const indexes = new Map(block.indexes);
		if (this.index) indexes.set(this.index, this.context);

		const changeableIndexes = new Map(block.changeableIndexes);
		if (this.index) changeableIndexes.set(this.index, this.key);

		if (this.destructuredContexts) {
			for (let i = 0; i < this.destructuredContexts.length; i += 1) {
				contexts.set(this.destructuredContexts[i], `${context}[${i}]`);
			}
		}

		this._block = block.child({
			comment: createDebuggingComment(this, this.generator),
			name: this.generator.getUniqueName('create_each_block'),
			context: this.context,
			key: this.key,

			contexts,
			indexes,
			changeableIndexes,

			listName,
			indexName,

			indexNames,
			listNames,
			params: block.params.concat(listName, context, indexName),
		});

		this.generator.blocks.push(this._block);
		this.initChildren(this._block, stripWhitespace, nextSibling);
		block.addDependencies(this._block.dependencies);
		this._block.hasUpdateMethod = this._block.dependencies.size > 0;

		if (this.else) {
			this.else._block = block.child({
				comment: '// TODO', // createDebuggingComment(this.else, generator),
				name: this.generator.getUniqueName(`${this._block.name}_else`),
			});

			this.generator.blocks.push(this.else._block);
			this.else.initChildren(
				this.else._block,
				stripWhitespace,
				nextSibling
			);
			this.else._block.hasUpdateMethod = this.else._block.dependencies.size > 0;
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		const each = this.var;

		const create_each_block = this._block.name;
		const each_block_value = this._block.listName;
		const iterations = this.iterations;
		const params = block.params.join(', ');

		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${each}_anchor`)
			: (this.next && this.next.var) || 'null';

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.start + 3;
		while (generator.source[c] !== 'e') c += 1;
		generator.code.overwrite(c, c + 4, 'length');
		const length = `[✂${c}-${c+4}✂]`;

		const mountOrIntro = this._block.hasIntroMethod ? 'i' : 'm';
		const vars = {
			each,
			create_each_block,
			each_block_value,
			length,
			iterations,
			params,
			anchor,
			mountOrIntro,
		};

		block.contextualise(this.expression);
		const { snippet } = this.metadata;

		block.builders.init.addLine(`var ${each_block_value} = ${snippet};`);

		if (this.key) {
			keyed(generator, block, parentNode, parentNodes, this, snippet, vars);
		} else {
			unkeyed(generator, block, parentNode, parentNodes, this, snippet, vars);
		}

		const isToplevel = !parentNode;

		if (needsAnchor) {
			block.addElement(
				anchor,
				`@createComment()`,
				`@createComment()`,
				parentNode
			);
		}

		if (this.else) {
			const each_block_else = generator.getUniqueName(`${each}_else`);

			block.builders.init.addLine(`var ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.builders.init.addBlock(deindent`
				if (!${each_block_value}.${length}) {
					${each_block_else} = ${this.else._block.name}(${params}, #component);
					${each_block_else}.c();
				}
			`);

			block.builders.mount.addBlock(deindent`
				if (${each_block_else}) {
					${each_block_else}.${mountOrIntro}(${parentNode || '#target'}, null);
				}
			`);

			const targetNode = parentNode || `${anchor}.parentNode`;

			if (this.else._block.hasUpdateMethod) {
				block.builders.update.addBlock(deindent`
					if (!${each_block_value}.${length} && ${each_block_else}) {
						${each_block_else}.p( changed, ${params} );
					} else if (!${each_block_value}.${length}) {
						${each_block_else} = ${this.else._block.name}(${params}, #component);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${targetNode}, ${anchor});
					} else if (${each_block_else}) {
						${each_block_else}.u();
						${each_block_else}.d();
						${each_block_else} = null;
					}
				`);
			} else {
				block.builders.update.addBlock(deindent`
					if (${each_block_value}.${length}) {
						if (${each_block_else}) {
							${each_block_else}.u();
							${each_block_else}.d();
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else._block.name}(${params}, #component);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${targetNode}, ${anchor});
					}
				`);
			}

			block.builders.unmount.addLine(
				`if (${each_block_else}) ${each_block_else}.u()`
			);

			block.builders.destroy.addBlock(deindent`
				if (${each_block_else}) ${each_block_else}.d();
			`);
		}

		this.children.forEach((child: Node) => {
			child.build(this._block, null, 'nodes');
		});

		if (this.else) {
			this.else.children.forEach((child: Node) => {
				child.build(this.else._block, null, 'nodes');
			});
		}
	}
}

function keyed(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
	parentNodes: string,
	node: EachBlock,
	snippet: string,
	{
		each,
		create_each_block,
		each_block_value,
		length,
		params,
		anchor,
		mountOrIntro,
	}
) {
	const key = block.getUniqueName('key');
	const lookup = block.getUniqueName(`${each}_lookup`);
	const iteration = block.getUniqueName(`${each}_iteration`);
	const head = block.getUniqueName(`${each}_head`);
	const last = block.getUniqueName(`${each}_last`);
	const expected = block.getUniqueName(`${each}_expected`);

	block.addVariable(lookup, `@blankObject()`);
	block.addVariable(head);
	block.addVariable(last);

	if (node.children[0] && node.children[0].type === 'Element' && !generator.components.has(node.children[0].name)) {
		// TODO or text/tag/raw
		node._block.first = node.children[0].var; // TODO this is highly confusing
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
		for (var #i = 0; #i < ${each_block_value}.${length}; #i += 1) {
			var ${key} = ${each_block_value}[#i].${node.key};
			var ${iteration} = ${lookup}[${key}] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key});

			if (${last}) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${last} = ${iteration};

			if (#i === 0) ${head} = ${iteration};
		}
	`);

	const targetNode = parentNode || '#target';
	const anchorNode = parentNode ? 'null' : 'anchor';

	block.builders.create.addBlock(deindent`
		var ${iteration} = ${head};
		while (${iteration}) {
			${iteration}.c();
			${iteration} = ${iteration}.next;
		}
	`);

	block.builders.claim.addBlock(deindent`
		var ${iteration} = ${head};
		while (${iteration}) {
			${iteration}.l(${parentNodes});
			${iteration} = ${iteration}.next;
		}
	`);

	block.builders.mount.addBlock(deindent`
		var ${iteration} = ${head};
		while (${iteration}) {
			${iteration}.${mountOrIntro}(${targetNode}, ${anchorNode});
			${iteration} = ${iteration}.next;
		}
	`);

	const dynamic = node._block.hasUpdateMethod;
	const mountNode = node.parent.isDomNode() ? node.parent.var : `${anchor}.parentNode`;

	let destroy;
	if (node._block.hasOutroMethod) {
		const fn = block.getUniqueName(`${each}_outro`);
		block.builders.init.addBlock(deindent`
			function ${fn}(iteration) {
				iteration.o(function() {
					iteration.u();
					iteration.d();
					${lookup}[iteration.key] = null;
				});
			}
		`);

		destroy = deindent`
			while (${expected}) {
				${fn}(${expected});
				${expected} = ${expected}.next;
			}

			for (#i = 0; #i < discard_pile.length; #i += 1) {
				if (discard_pile[#i].discard) {
					${fn}(discard_pile[#i]);
				}
			}
		`;
	} else {
		const fn = block.getUniqueName(`${each}_destroy`);
		block.builders.init.addBlock(deindent`
			function ${fn}(iteration) {
				iteration.u();
				iteration.d();
				${lookup}[iteration.key] = null;
			}
		`);

		destroy = deindent`
			while (${expected}) {
				${fn}(${expected});
				${expected} = ${expected}.next;
			}

			for (#i = 0; #i < discard_pile.length; #i += 1) {
				var ${iteration} = discard_pile[#i];
				if (${iteration}.discard) {
					${fn}(${iteration});
				}
			}
		`;
	}

	block.builders.update.addBlock(deindent`
		var ${each_block_value} = ${snippet};

		var ${expected} = ${head};
		var ${last} = null;

		var discard_pile = [];

		for (#i = 0; #i < ${each_block_value}.${length}; #i += 1) {
			var ${key} = ${each_block_value}[#i].${node.key};
			var ${iteration} = ${lookup}[${key}];

			${dynamic &&
				`if (${iteration}) ${iteration}.p(changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i);`}

			if (${expected}) {
				if (${key} === ${expected}.key) {
					${expected} = ${expected}.next;
				} else {
					if (${iteration}) {
						// probably a deletion
						while (${expected} && ${expected}.key !== ${key}) {
							${expected}.discard = true;
							discard_pile.push(${expected});
							${expected} = ${expected}.next;
						};

						${expected} = ${expected} && ${expected}.next;
						${iteration}.discard = false;
						${iteration}.last = ${last};

						if (!${expected}) ${iteration}.m(${mountNode}, ${anchor});
					} else {
						// key is being inserted
						${iteration} = ${lookup}[${key}] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key});
						${iteration}.c();
						${iteration}.${mountOrIntro}(${mountNode}, ${expected}.first);

						${expected}.last = ${iteration};
						${iteration}.next = ${expected};
					}
				}
			} else {
				// we're appending from this point forward
				if (${iteration}) {
					${iteration}.discard = false;
					${iteration}.next = null;
					${iteration}.m(${mountNode}, ${anchor});
				} else {
					${iteration} = ${lookup}[${key}] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component, ${key});
					${iteration}.c();
					${iteration}.${mountOrIntro}(${mountNode}, ${anchor});
				}
			}

			if (${last}) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${node._block.hasIntroMethod && `${iteration}.i(${mountNode}, ${anchor});`}
			${last} = ${iteration};
		}

		if (${last}) ${last}.next = null;

		${destroy}

		${head} = ${lookup}[${each_block_value}[0] && ${each_block_value}[0].${node.key}];
	`);

	if (!parentNode) {
		block.builders.unmount.addBlock(deindent`
			var ${iteration} = ${head};
			while (${iteration}) {
				${iteration}.u();
				${iteration} = ${iteration}.next;
			}
		`);
	}

	block.builders.destroy.addBlock(deindent`
		var ${iteration} = ${head};
		while (${iteration}) {
			${iteration}.d();
			${iteration} = ${iteration}.next;
		}
	`);
}

function unkeyed(
	generator: DomGenerator,
	block: Block,
	parentNode: string,
	parentNodes: string,
	node: EachBlock,
	snippet: string,
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

		for (var #i = 0; #i < ${each_block_value}.${length}; #i += 1) {
			${iterations}[#i] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component);
		}
	`);

	const targetNode = parentNode || '#target';
	const anchorNode = parentNode ? 'null' : 'anchor';

	block.builders.create.addBlock(deindent`
		for (var #i = 0; #i < ${iterations}.length; #i += 1) {
			${iterations}[#i].c();
		}
	`);

	block.builders.claim.addBlock(deindent`
		for (var #i = 0; #i < ${iterations}.length; #i += 1) {
			${iterations}[#i].l(${parentNodes});
		}
	`);

	block.builders.mount.addBlock(deindent`
		for (var #i = 0; #i < ${iterations}.length; #i += 1) {
			${iterations}[#i].${mountOrIntro}(${targetNode}, ${anchorNode});
		}
	`);

	const allDependencies = new Set(node._block.dependencies);
	const { dependencies } = node.metadata;
	dependencies.forEach((dependency: string) => {
		allDependencies.add(dependency);
	});

	// TODO do this for keyed blocks as well
	const condition = Array.from(allDependencies)
		.map(dependency => `changed.${dependency}`)
		.join(' || ');

	const mountNode = node.parent.isDomNode() ? node.parent.var : `${anchor}.parentNode`;

	if (condition !== '') {
		const forLoopBody = node._block.hasUpdateMethod
			? node._block.hasIntroMethod
				? deindent`
					if (${iterations}[#i]) {
						${iterations}[#i].p(changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i);
					} else {
						${iterations}[#i] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component);
						${iterations}[#i].c();
					}
					${iterations}[#i].i(${mountNode}, ${anchor});
				`
				: deindent`
					if (${iterations}[#i]) {
						${iterations}[#i].p(changed, ${params}, ${each_block_value}, ${each_block_value}[#i], #i);
					} else {
						${iterations}[#i] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component);
						${iterations}[#i].c();
						${iterations}[#i].m(${mountNode}, ${anchor});
					}
				`
			: deindent`
				${iterations}[#i] = ${create_each_block}(${params}, ${each_block_value}, ${each_block_value}[#i], #i, #component);
				${iterations}[#i].c();
				${iterations}[#i].${mountOrIntro}(${mountNode}, ${anchor});
			`;

		const start = node._block.hasUpdateMethod ? '0' : `${iterations}.length`;

		const outro = block.getUniqueName('outro');
		const destroy = node._block.hasOutroMethod
			? deindent`
				function ${outro}(i) {
					if (${iterations}[i]) {
						${iterations}[i].o(function() {
							${iterations}[i].u();
							${iterations}[i].d();
							${iterations}[i] = null;
						});
					}
				}

				for (; #i < ${iterations}.length; #i += 1) ${outro}(#i);
			`
			: deindent`
				for (; #i < ${iterations}.length; #i += 1) {
					${iterations}[#i].u();
					${iterations}[#i].d();
				}
				${iterations}.length = ${each_block_value}.${length};
			`;

		block.builders.update.addBlock(deindent`
			var ${each_block_value} = ${snippet};

			if (${condition}) {
				for (var #i = ${start}; #i < ${each_block_value}.${length}; #i += 1) {
					${forLoopBody}
				}

				${destroy}
			}
		`);
	}

	block.builders.unmount.addBlock(deindent`
		for (var #i = 0; #i < ${iterations}.length; #i += 1) {
			${iterations}[#i].u();
		}
	`);

	block.builders.destroy.addBlock(`@destroyEach(${iterations});`);
}