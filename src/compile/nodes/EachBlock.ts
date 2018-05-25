import deindent from '../../utils/deindent';
import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import Block from '../dom/Block';
import createDebuggingComment from '../../utils/createDebuggingComment';
import Expression from './shared/Expression';
import mapChildren from './shared/mapChildren';
import TemplateScope from './shared/TemplateScope';
import unpackDestructuring from '../../utils/unpackDestructuring';

export default class EachBlock extends Node {
	type: 'EachBlock';

	block: Block;
	expression: Expression;

	iterations: string;
	index: string;
	context: string;
	key: Expression;
	scope: TemplateScope;
	contexts: Array<{ name: string, tail: string }>;

	children: Node[];
	else?: ElseBlock;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.expression = new Expression(compiler, this, scope, info.expression);
		this.context = info.context.name || 'each'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.index = info.index;

		this.scope = scope.child();

		this.contexts = [];
		unpackDestructuring(this.contexts, info.context, '');

		this.contexts.forEach(context => {
			this.scope.add(context.key.name, this.expression.dependencies);
		});

		this.key = info.key
			? new Expression(compiler, this, this.scope, info.key)
			: null;

		if (this.index) {
			// index can only change if this is a keyed each block
			const dependencies = this.key ? this.expression.dependencies : [];
			this.scope.add(this.index, dependencies);
		}

		this.children = mapChildren(compiler, this, this.scope, info.children);

		this.else = info.else
			? new ElseBlock(compiler, this, this.scope, info.else)
			: null;
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.var = block.getUniqueName(`each`);
		this.iterations = block.getUniqueName(`${this.var}_blocks`);
		this.get_each_context = this.compiler.getUniqueName(`get_${this.var}_context`);

		const { dependencies } = this.expression;
		block.addDependencies(dependencies);

		this.block = block.child({
			comment: createDebuggingComment(this, this.compiler),
			name: this.compiler.getUniqueName('create_each_block'),
			key: this.key,

			bindings: new Map(block.bindings)
		});

		this.each_block_value = this.compiler.getUniqueName('each_value');

		const indexName = this.index || this.compiler.getUniqueName(`${this.context}_index`);

		this.contexts.forEach(prop => {
			this.block.bindings.set(prop.key.name, `ctx.${this.each_block_value}[ctx.${indexName}]${prop.tail}`);
		});

		if (this.index) {
			this.block.getUniqueName(this.index); // this prevents name collisions (#1254)
		}

		this.contextProps = this.contexts.map(prop => `child_ctx.${prop.key.name} = list[i]${prop.tail};`);

		// TODO only add these if necessary
		this.contextProps.push(
			`child_ctx.${this.each_block_value} = list;`,
			`child_ctx.${indexName} = i;`
		);

		this.compiler.target.blocks.push(this.block);
		this.initChildren(this.block, stripWhitespace, nextSibling);
		block.addDependencies(this.block.dependencies);
		this.block.hasUpdateMethod = this.block.dependencies.size > 0;

		if (this.else) {
			this.else.block = block.child({
				comment: createDebuggingComment(this.else, this.compiler),
				name: this.compiler.getUniqueName(`${this.block.name}_else`),
			});

			this.compiler.target.blocks.push(this.else.block);
			this.else.initChildren(
				this.else.block,
				stripWhitespace,
				nextSibling
			);
			this.else.block.hasUpdateMethod = this.else.block.dependencies.size > 0;
		}

		if (this.block.hasOutros || (this.else && this.else.block.hasOutros)) {
			block.addOutro();
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		if (this.children.length === 0) return;

		const { compiler } = this;

		const each = this.var;

		const create_each_block = this.block.name;
		const iterations = this.iterations;

		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${each}_anchor`)
			: (this.next && this.next.var) || 'null';

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.start + 2;
		while (compiler.source[c] !== 'e') c += 1;
		compiler.code.overwrite(c, c + 4, 'length');
		const length = `[✂${c}-${c+4}✂]`;

		const mountOrIntro = (this.block.hasIntroMethod || this.block.hasOutroMethod) ? 'i' : 'm';
		const vars = {
			each,
			create_each_block,
			length,
			iterations,
			anchor,
			mountOrIntro,
		};

		const { snippet } = this.expression;

		block.builders.init.addLine(`var ${this.each_block_value} = ${snippet};`);

		this.compiler.target.blocks.push(deindent`
			function ${this.get_each_context}(ctx, list, i) {
				const child_ctx = Object.create(ctx);
				${this.contextProps}
				return child_ctx;
			}
		`);

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
			const each_block_else = compiler.getUniqueName(`${each}_else`);

			block.builders.init.addLine(`var ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.builders.init.addBlock(deindent`
				if (!${this.each_block_value}.${length}) {
					${each_block_else} = ${this.else.block.name}(#component, ctx);
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
					if (!${this.each_block_value}.${length} && ${each_block_else}) {
						${each_block_else}.p(changed, ctx);
					} else if (!${this.each_block_value}.${length}) {
						${each_block_else} = ${this.else.block.name}(#component, ctx);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${anchor});
					} else if (${each_block_else}) {
						${each_block_else}.d(1);
						${each_block_else} = null;
					}
				`);
			} else {
				block.builders.update.addBlock(deindent`
					if (${this.each_block_value}.${length}) {
						if (${each_block_else}) {
							${each_block_else}.d(1);
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else.block.name}(#component, ctx);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${anchor});
					}
				`);
			}

			block.builders.destroy.addBlock(deindent`
				if (${each_block_else}) ${each_block_else}.d(${parentNode ? '' : 'detach'});
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
			length,
			anchor,
			mountOrIntro,
		}
	) {
		const get_key = block.getUniqueName('get_key');
		const blocks = block.getUniqueName(`${each}_blocks`);
		const lookup = block.getUniqueName(`${each}_lookup`);

		block.addVariable(blocks, '[]');
		block.addVariable(lookup, `@blankObject()`);

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
			const ${get_key} = ctx => ${this.key.snippet};

			for (var #i = 0; #i < ${this.each_block_value}.${length}; #i += 1) {
				let child_ctx = ${this.get_each_context}(ctx, ${this.each_block_value}, #i);
				let key = ${get_key}(child_ctx);
				${blocks}[#i] = ${lookup}[key] = ${create_each_block}(#component, key, child_ctx);
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].c();
		`);

		if (parentNodes) {
			block.builders.claim.addBlock(deindent`
				for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].l(${parentNodes});
			`);
		}

		block.builders.mount.addBlock(deindent`
			for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].${mountOrIntro}(${initialMountNode}, ${anchorNode});
		`);

		const dynamic = this.block.hasUpdateMethod;

		const rects = block.getUniqueName('rects');
		const destroy = this.block.hasAnimation
			? `@fixAndOutroAndDestroyBlock`
			: this.block.hasOutros
				? `@outroAndDestroyBlock`
				: `@destroyBlock`;

		block.builders.update.addBlock(deindent`
			const ${this.each_block_value} = ${snippet};

			${this.block.hasOutros && `@transitionManager.groupOutros();`}
			${this.block.hasAnimation && `for (let #i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].r();`}
			${blocks} = @updateKeyedEach(${blocks}, #component, changed, ${get_key}, ${dynamic ? '1' : '0'}, ctx, ${this.each_block_value}, ${lookup}, ${updateMountNode}, ${destroy}, ${create_each_block}, "${mountOrIntro}", ${anchor}, ${this.get_each_context});
			${this.block.hasAnimation && `for (let #i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].a();`}
		`);

		if (this.compiler.options.nestedTransitions) {
			const countdown = block.getUniqueName('countdown');
			block.builders.outro.addBlock(deindent`
				const ${countdown} = @callAfter(#outrocallback, ${blocks}.length);
				for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].o(${countdown});
			`);
		}

		block.builders.destroy.addBlock(deindent`
			for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].d(${parentNode ? '' : 'detach'});
		`);
	}

	buildUnkeyed(
		block: Block,
		parentNode: string,
		parentNodes: string,
		snippet: string,
		{
			create_each_block,
			length,
			iterations,
			anchor,
			mountOrIntro,
		}
	) {
		block.builders.init.addBlock(deindent`
			var ${iterations} = [];

			for (var #i = 0; #i < ${this.each_block_value}.${length}; #i += 1) {
				${iterations}[#i] = ${create_each_block}(#component, ${this.get_each_context}(ctx, ${this.each_block_value}, #i));
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
		const { dependencies } = this.expression;
		dependencies.forEach((dependency: string) => {
			allDependencies.add(dependency);
		});

		const outroBlock = this.block.hasOutros && block.getUniqueName('outroBlock')
		if (outroBlock) {
			block.builders.init.addBlock(deindent`
				function ${outroBlock}(i, detach, fn) {
					if (${iterations}[i]) {
						${iterations}[i].o(() => {
							if (detach) {
								${iterations}[i].d(detach);
								${iterations}[i] = null;
							}
							if (fn) fn();
						});
					}
				}
			`);
		}

		// TODO do this for keyed blocks as well
		const condition = Array.from(allDependencies)
			.map(dependency => `changed.${dependency}`)
			.join(' || ');

		if (condition !== '') {
			const forLoopBody = this.block.hasUpdateMethod
				? (this.block.hasIntros || this.block.hasOutros)
					? deindent`
						if (${iterations}[#i]) {
							${iterations}[#i].p(changed, child_ctx);
						} else {
							${iterations}[#i] = ${create_each_block}(#component, child_ctx);
							${iterations}[#i].c();
						}
						${iterations}[#i].i(${updateMountNode}, ${anchor});
					`
					: deindent`
						if (${iterations}[#i]) {
							${iterations}[#i].p(changed, child_ctx);
						} else {
							${iterations}[#i] = ${create_each_block}(#component, child_ctx);
							${iterations}[#i].c();
							${iterations}[#i].m(${updateMountNode}, ${anchor});
						}
					`
				: deindent`
					${iterations}[#i] = ${create_each_block}(#component, child_ctx);
					${iterations}[#i].c();
					${iterations}[#i].${mountOrIntro}(${updateMountNode}, ${anchor});
				`;

			const start = this.block.hasUpdateMethod ? '0' : `${iterations}.length`;

			let destroy;

			if (this.block.hasOutros) {
				destroy = deindent`
					@transitionManager.groupOutros();
					for (; #i < ${iterations}.length; #i += 1) ${outroBlock}(#i, 1);
				`;
			} else {
				destroy = deindent`
					for (; #i < ${iterations}.length; #i += 1) {
						${iterations}[#i].d(1);
					}
					${iterations}.length = ${this.each_block_value}.${length};
				`;
			}

			block.builders.update.addBlock(deindent`
				if (${condition}) {
					${this.each_block_value} = ${snippet};

					for (var #i = ${start}; #i < ${this.each_block_value}.${length}; #i += 1) {
						const child_ctx = ${this.get_each_context}(ctx, ${this.each_block_value}, #i);

						${forLoopBody}
					}

					${destroy}
				}
			`);
		}

		if (outroBlock && this.compiler.options.nestedTransitions) {
			const countdown = block.getUniqueName('countdown');
			block.builders.outro.addBlock(deindent`
				const ${countdown} = @callAfter(#outrocallback, ${iterations}.length);
				for (let #i = 0; #i < ${iterations}.length; #i += 1) ${outroBlock}(#i, 0, ${countdown});`
			);
		}

		block.builders.destroy.addBlock(`@destroyEach(${iterations}, detach);`);
	}

	remount(name: string) {
		// TODO consider keyed blocks
		return `for (var #i = 0; #i < ${this.iterations}.length; #i += 1) ${this.iterations}[#i].m(${name}._slotted.default, null);`;
	}

	ssr() {
		const { compiler } = this;
		const { snippet } = this.expression;

		const props = this.contexts.map(prop => `${prop.key.name}: item${prop.tail}`);

		const getContext = this.index
			? `(item, i) => Object.assign({}, ctx, { ${props.join(', ')}, ${this.index}: i })`
			: `item => Object.assign({}, ctx, { ${props.join(', ')} })`;

		const open = `\${ ${this.else ? `${snippet}.length ? ` : ''}@each(${snippet}, ${getContext}, ctx => \``;
		compiler.target.append(open);

		this.children.forEach((child: Node) => {
			child.ssr();
		});

		const close = `\`)`;
		compiler.target.append(close);

		if (this.else) {
			compiler.target.append(` : \``);
			this.else.children.forEach((child: Node) => {
				child.ssr();
			});
			compiler.target.append(`\``);
		}

		compiler.target.append('}');
	}
}
