import deindent from '../../utils/deindent';
import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import { DomGenerator } from '../dom/index';
import Block from '../dom/Block';
import createDebuggingComment from '../../utils/createDebuggingComment';

export default class EachBlock extends Node {
	type: 'EachBlock';

	block: Block;
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
		this.each_context = block.getUniqueName(`${this.var}_context`);

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

		const contextTypes = new Map(block.contextTypes);
		contextTypes.set(this.context, 'each');

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

		this.block = block.child({
			comment: createDebuggingComment(this, this.generator),
			name: this.generator.getUniqueName('create_each_block'),
			context: this.context,
			key: this.key,

			contexts,
			contextTypes,
			indexes,
			changeableIndexes,

			listName,
			indexName,

			indexNames,
			listNames
		});

		this.generator.blocks.push(this.block);
		this.initChildren(this.block, stripWhitespace, nextSibling);
		block.addDependencies(this.block.dependencies);
		this.block.hasUpdateMethod = this.block.dependencies.size > 0;

		if (this.else) {
			this.else.block = block.child({
				comment: createDebuggingComment(this.else, this.generator),
				name: this.generator.getUniqueName(`${this.block.name}_else`),
			});

			this.generator.blocks.push(this.else.block);
			this.else.initChildren(
				this.else.block,
				stripWhitespace,
				nextSibling
			);
			this.else.block.hasUpdateMethod = this.else.block.dependencies.size > 0;
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		const each = this.var;

		const create_each_block = this.block.name;
		const each_block_value = this.block.listName;
		const iterations = this.iterations;

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

		const mountOrIntro = this.block.hasIntroMethod ? 'i' : 'm';
		const vars = {
			each,
			create_each_block,
			each_block_value,
			length,
			iterations,
			anchor,
			mountOrIntro,
		};

		block.contextualise(this.expression);
		const { snippet } = this.metadata;

		block.builders.init.addLine(`var ${each_block_value} = ${snippet};`);

		if (this.key) {
			this.buildKeyed(block, parentNode, parentNodes, snippet, vars);
		} else {
			this.buildUnkeyed(block, parentNode, parentNodes, snippet, vars);
		}

		if (needsAnchor) {
			block.addElement(
				anchor,
				`@createComment()`,
				parentNodes && `@createComment()`,
				parentNode
			);
		}

		if (this.else) {
			const each_block_else = generator.getUniqueName(`${each}_else`);

			block.builders.init.addLine(`var ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.builders.init.addBlock(deindent`
				if (!${each_block_value}.${length}) {
					${each_block_else} = ${this.else.block.name}(#component, state);
					${each_block_else}.c();
				}
			`);

			block.builders.mount.addBlock(deindent`
				if (${each_block_else}) {
					${each_block_else}.${mountOrIntro}(${parentNode || '#target'}, null);
				}
			`);

			const initialMountNode = parentNode || `${anchor}.parentNode`;

			if (this.else.block.hasUpdateMethod) {
				block.builders.update.addBlock(deindent`
					if (!${each_block_value}.${length} && ${each_block_else}) {
						${each_block_else}.p(changed, state);
					} else if (!${each_block_value}.${length}) {
						${each_block_else} = ${this.else.block.name}(#component, state);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${anchor});
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
						${each_block_else} = ${this.else.block.name}(#component, state);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${anchor});
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
			child.build(this.block, null, 'nodes');
		});

		if (this.else) {
			this.else.children.forEach((child: Node) => {
				child.build(this.else.block, null, 'nodes');
			});
		}
	}

	buildKeyed(
		block: Block,
		parentNode: string,
		parentNodes: string,
		snippet: string,
		{
			each,
			create_each_block,
			each_block_value,
			length,
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

		if (this.children[0].isDomNode()) {
			this.block.first = this.children[0].var;
		} else {
			this.block.first = this.block.getUniqueName('first');
			this.block.addElement(
				this.block.first,
				`@createComment()`,
				parentNodes && `@createComment()`,
				null
			);
		}

		block.builders.init.addBlock(deindent`
			for (var #i = 0; #i < ${each_block_value}.${length}; #i += 1) {
				var ${key} = ${each_block_value}[#i].${this.key};
				var ${iteration} = ${lookup}[${key}] = ${create_each_block}(#component, state, ${key});

				if (${last}) ${last}.next = ${iteration};
				${iteration}.last = ${last};
				${last} = ${iteration};

				if (#i === 0) ${head} = ${iteration};
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			var ${iteration} = ${head};
			while (${iteration}) {
				${iteration}.c();
				${iteration} = ${iteration}.next;
			}
		`);

		if (parentNodes) {
			block.builders.claim.addBlock(deindent`
				var ${iteration} = ${head};
				while (${iteration}) {
					${iteration}.l(${parentNodes});
					${iteration} = ${iteration}.next;
				}
			`);
		}

		block.builders.mount.addBlock(deindent`
			var ${iteration} = ${head};
			while (${iteration}) {
				${iteration}.${mountOrIntro}(${initialMountNode}, ${anchorNode});
				${iteration} = ${iteration}.next;
			}
		`);

		const dynamic = this.block.hasUpdateMethod;

		let destroy;
		if (this.block.hasOutroMethod) {
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
				var ${key} = ${each_block_value}[#i].${this.key};
				var ${iteration} = ${lookup}[${key}];

				${dynamic &&
					`if (${iteration}) ${iteration}.p(changed, state);`}

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

							if (!${expected}) ${iteration}.m(${updateMountNode}, ${anchor});
						} else {
							// key is being inserted
							${iteration} = ${lookup}[${key}] = ${create_each_block}(#component, state, ${key});
							${iteration}.c();
							${iteration}.${mountOrIntro}(${updateMountNode}, ${expected}.first);

							${expected}.last = ${iteration};
							${iteration}.next = ${expected};
						}
					}
				} else {
					// we're appending from this point forward
					if (${iteration}) {
						${iteration}.discard = false;
						${iteration}.next = null;
						${iteration}.m(${updateMountNode}, ${anchor});
					} else {
						${iteration} = ${lookup}[${key}] = ${create_each_block}(#component, state, ${key});
						${iteration}.c();
						${iteration}.${mountOrIntro}(${updateMountNode}, ${anchor});
					}
				}

				if (${last}) ${last}.next = ${iteration};
				${iteration}.last = ${last};
				${this.block.hasIntroMethod && `${iteration}.i(${updateMountNode}, ${anchor});`}
				${last} = ${iteration};
			}

			if (${last}) ${last}.next = null;

			${destroy}

			${head} = ${lookup}[${each_block_value}[0] && ${each_block_value}[0].${this.key}];
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

	buildUnkeyed(
		block: Block,
		parentNode: string,
		parentNodes: string,
		snippet: string,
		{
			create_each_block,
			each_block_value,
			length,
			iterations,
			anchor,
			mountOrIntro,
		}
	) {
		block.builders.init.addBlock(deindent`
			var ${iterations} = [];

			for (var #i = 0; #i < ${each_block_value}.${length}; #i += 1) {
				${iterations}[#i] = ${create_each_block}(#component, @assign({}, state, {
					${this.context}: ${each_block_value}[#i],
					${this.block.indexName}: #i
				}));
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			for (var #i = 0; #i < ${iterations}.length; #i += 1) {
				${iterations}[#i].c();
			}
		`);

		if (parentNodes) {
			block.builders.claim.addBlock(deindent`
				for (var #i = 0; #i < ${iterations}.length; #i += 1) {
					${iterations}[#i].l(${parentNodes});
				}
			`);
		}

		block.builders.mount.addBlock(deindent`
			for (var #i = 0; #i < ${iterations}.length; #i += 1) {
				${iterations}[#i].${mountOrIntro}(${initialMountNode}, ${anchorNode});
			}
		`);

		const allDependencies = new Set(this.block.dependencies);
		const { dependencies } = this.metadata;
		dependencies.forEach((dependency: string) => {
			allDependencies.add(dependency);
		});

		// TODO do this for keyed blocks as well
		const condition = Array.from(allDependencies)
			.map(dependency => `changed.${dependency}`)
			.join(' || ');

		if (condition !== '') {
			const forLoopBody = this.block.hasUpdateMethod
				? this.block.hasIntroMethod
					? deindent`
						if (${iterations}[#i]) {
							${iterations}[#i].p(changed, ${this.each_context});
						} else {
							${iterations}[#i] = ${create_each_block}(#component, ${this.each_context});
							${iterations}[#i].c();
						}
						${iterations}[#i].i(${updateMountNode}, ${anchor});
					`
					: deindent`
						if (${iterations}[#i]) {
							${iterations}[#i].p(changed, ${this.each_context});
						} else {
							${iterations}[#i] = ${create_each_block}(#component, ${this.each_context});
							${iterations}[#i].c();
							${iterations}[#i].m(${updateMountNode}, ${anchor});
						}
					`
				: deindent`
					${iterations}[#i] = ${create_each_block}(#component, ${this.each_context});
					${iterations}[#i].c();
					${iterations}[#i].${mountOrIntro}(${updateMountNode}, ${anchor});
				`;

			const start = this.block.hasUpdateMethod ? '0' : `${iterations}.length`;

			const outro = block.getUniqueName('outro');
			const destroy = this.block.hasOutroMethod
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
						var ${this.each_context} = @assign({}, state, {
							${this.context}: ${each_block_value}[#i],
							${this.block.indexName}: #i
						});

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
}
