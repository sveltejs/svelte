import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Wrapper from './shared/Wrapper';
import createDebuggingComment from '../../../utils/createDebuggingComment';
import EachBlock from '../../nodes/EachBlock';
import FragmentWrapper from './Fragment';
import deindent from '../../../utils/deindent';
import ElseBlock from '../../nodes/ElseBlock';

class ElseBlockWrapper extends Wrapper {
	node: ElseBlock;
	block: Block;
	fragment: FragmentWrapper;
	isDynamic: boolean;

	var = null;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: ElseBlock,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.block = block.child({
			comment: createDebuggingComment(node, this.renderer.component),
			name: this.renderer.component.getUniqueName(`create_else_block`)
		});

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			this.node.children,
			parent,
			stripWhitespace,
			nextSibling
		);

		this.isDynamic = this.block.dependencies.size > 0;
		if (this.isDynamic) {
			// TODO this can't be right
			this.block.hasUpdateMethod = true;
		}
	}
}

export default class EachBlockWrapper extends Wrapper {
	block: Block;
	node: EachBlock;
	fragment: FragmentWrapper;
	else?: ElseBlockWrapper;
	vars: {
		anchor: string;
		create_each_block: string;
		each_block_value: string;
		get_each_context: string;
		iterations: string;
		length: string;
		mountOrIntro: string;
	}

	contextProps: string[];
	indexName: string;

	var = 'each';
	hasBinding = false;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: EachBlock,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();

		const { dynamic_dependencies } = node.expression;
		block.addDependencies(dynamic_dependencies);

		this.block = block.child({
			comment: createDebuggingComment(this.node, this.renderer.component),
			name: renderer.component.getUniqueName('create_each_block'),
			key: <string>node.key, // TODO...

			bindings: new Map(block.bindings),
			contextOwners: new Map(block.contextOwners)
		});

		// TODO this seems messy
		this.block.hasAnimation = this.node.hasAnimation;

		this.indexName = this.node.index || renderer.component.getUniqueName(`${this.node.context}_index`);

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.node.start + 2;
		while (renderer.component.source[c] !== 'e') c += 1;
		renderer.component.code.overwrite(c, c + 4, 'length');
		const length = `[✂${c}-${c+4}✂]`;

		this.vars = {
			create_each_block: this.block.name,
			each_block_value: renderer.component.getUniqueName(`${this.var}_value`),
			get_each_context: renderer.component.getUniqueName(`get_${this.var}_context`),
			iterations: block.getUniqueName(`${this.var}_blocks`),
			length: `[✂${c}-${c+4}✂]`,

			// filled out later
			anchor: null,
			mountOrIntro: null
		};

		node.contexts.forEach(prop => {
			this.block.contextOwners.set(prop.key.name, this);

			this.block.bindings.set(prop.key.name, {
				object: this.vars.each_block_value,
				property: this.indexName,
				snippet: `${this.vars.each_block_value}[${this.indexName}]${prop.tail}`
			});
		});

		if (this.node.index) {
			this.block.getUniqueName(this.node.index); // this prevents name collisions (#1254)
		}

		renderer.blocks.push(this.block);

		this.fragment = new FragmentWrapper(renderer, this.block, node.children, this, stripWhitespace, nextSibling);

		if (this.node.else) {
			this.else = new ElseBlockWrapper(
				renderer,
				block,
				this,
				this.node.else,
				stripWhitespace,
				nextSibling
			);

			renderer.blocks.push(this.else.block);

			if (this.else.isDynamic) {
				this.block.addDependencies(this.else.block.dependencies);
			}
		}

		block.addDependencies(this.block.dependencies);
		this.block.hasUpdateMethod = this.block.dependencies.size > 0; // TODO should this logic be in Block?

		if (this.block.hasOutros || (this.else && this.else.block.hasOutros)) {
			block.addOutro();
		}
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		if (this.fragment.nodes.length === 0) return;

		const { renderer } = this;
		const { component } = renderer;

		const needsAnchor = this.next
			? !this.next.isDomNode() :
			!parentNode || !this.parent.isDomNode();

		this.vars.anchor = needsAnchor
			? block.getUniqueName(`${this.var}_anchor`)
			: (this.next && this.next.var) || 'null';

		this.vars.mountOrIntro = (this.block.hasIntroMethod || this.block.hasOutroMethod) ? 'i' : 'm';

		this.contextProps = this.node.contexts.map(prop => `child_ctx.${prop.key.name} = list[i]${prop.tail};`);

		if (this.hasBinding) this.contextProps.push(`child_ctx.${this.vars.each_block_value} = list;`);
		if (this.hasBinding || this.node.index) this.contextProps.push(`child_ctx.${this.indexName} = i;`);

		const snippet = this.node.expression.render(block);

		block.builders.init.addLine(`var ${this.vars.each_block_value} = ${snippet};`);

		renderer.blocks.push(deindent`
			function ${this.vars.get_each_context}(ctx, list, i) {
				const child_ctx = Object.create(ctx);
				${this.contextProps}
				return child_ctx;
			}
		`);

		if (this.node.key) {
			this.renderKeyed(block, parentNode, parentNodes, snippet);
		} else {
			this.renderUnkeyed(block, parentNode, parentNodes, snippet);
		}

		if (needsAnchor) {
			block.addElement(
				this.vars.anchor,
				`@createComment()`,
				parentNodes && `@createComment()`,
				parentNode
			);
		}

		if (this.else) {
			const each_block_else = component.getUniqueName(`${this.var}_else`);
			const mountOrIntro = (this.else.block.hasIntroMethod || this.else.block.hasOutroMethod) ? 'i' : 'm';

			block.builders.init.addLine(`var ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.builders.init.addBlock(deindent`
				if (!${this.vars.each_block_value}.${this.vars.length}) {
					${each_block_else} = ${this.else.block.name}($$, ctx);
					${each_block_else}.c();
				}
			`);

			block.builders.mount.addBlock(deindent`
				if (${each_block_else}) {
					${each_block_else}.${mountOrIntro}(${parentNode || '#target'}, null);
				}
			`);

			const initialMountNode = parentNode || `${this.vars.anchor}.parentNode`;

			if (this.else.block.hasUpdateMethod) {
				block.builders.update.addBlock(deindent`
					if (!${this.vars.each_block_value}.${this.vars.length} && ${each_block_else}) {
						${each_block_else}.p(changed, ctx);
					} else if (!${this.vars.each_block_value}.${this.vars.length}) {
						${each_block_else} = ${this.else.block.name}($$, ctx);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${this.vars.anchor});
					} else if (${each_block_else}) {
						${each_block_else}.d(1);
						${each_block_else} = null;
					}
				`);
			} else {
				block.builders.update.addBlock(deindent`
					if (${this.vars.each_block_value}.${this.vars.length}) {
						if (${each_block_else}) {
							${each_block_else}.d(1);
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else.block.name}($$, ctx);
						${each_block_else}.c();
						${each_block_else}.${mountOrIntro}(${initialMountNode}, ${this.vars.anchor});
					}
				`);
			}

			block.builders.destroy.addBlock(deindent`
				if (${each_block_else}) ${each_block_else}.d(${parentNode ? '' : 'detach'});
			`);
		}

		this.fragment.render(this.block, null, 'nodes');

		if (this.else) {
			this.else.fragment.render(this.else.block, null, 'nodes');
		}
	}

	renderKeyed(
		block: Block,
		parentNode: string,
		parentNodes: string,
		snippet: string
	) {
		const {
			create_each_block,
			length,
			anchor,
			mountOrIntro,
		} = this.vars;

		const get_key = block.getUniqueName('get_key');
		const blocks = block.getUniqueName(`${this.var}_blocks`);
		const lookup = block.getUniqueName(`${this.var}_lookup`);

		block.addVariable(blocks, '[]');
		block.addVariable(lookup, `@blankObject()`);

		if (this.fragment.nodes[0].isDomNode()) {
			this.block.first = this.fragment.nodes[0].var;
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
			const ${get_key} = ctx => ${this.node.key.render()};

			for (var #i = 0; #i < ${this.vars.each_block_value}.${length}; #i += 1) {
				let child_ctx = ${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i);
				let key = ${get_key}(child_ctx);
				${blocks}[#i] = ${lookup}[key] = ${create_each_block}($$, key, child_ctx);
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].c();
		`);

		if (parentNodes && this.renderer.options.hydratable) {
			block.builders.claim.addBlock(deindent`
				for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].l(${parentNodes});
			`);
		}

		block.builders.mount.addBlock(deindent`
			for (#i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].${mountOrIntro}(${initialMountNode}, ${anchorNode});
		`);

		const dynamic = this.block.hasUpdateMethod;

		const rects = block.getUniqueName('rects');
		const destroy = this.node.hasAnimation
			? `@fixAndOutroAndDestroyBlock`
			: this.block.hasOutros
				? `@outroAndDestroyBlock`
				: `@destroyBlock`;

		block.builders.update.addBlock(deindent`
			const ${this.vars.each_block_value} = ${snippet};

			${this.block.hasOutros && `@group_outros();`}
			${this.node.hasAnimation && `for (let #i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].r();`}
			${blocks} = @updateKeyedEach(${blocks}, $$, changed, ${get_key}, ${dynamic ? '1' : '0'}, ctx, ${this.vars.each_block_value}, ${lookup}, ${updateMountNode}, ${destroy}, ${create_each_block}, "${mountOrIntro}", ${anchor}, ${this.vars.get_each_context});
			${this.node.hasAnimation && `for (let #i = 0; #i < ${blocks}.length; #i += 1) ${blocks}[#i].a();`}
		`);

		if (this.block.hasOutros) {
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

	renderUnkeyed(
		block: Block,
		parentNode: string,
		parentNodes: string,
		snippet: string
	) {
		const {
			create_each_block,
			length,
			iterations,
			anchor,
			mountOrIntro,
		} = this.vars;

		block.builders.init.addBlock(deindent`
			var ${iterations} = [];

			for (var #i = 0; #i < ${this.vars.each_block_value}.${length}; #i += 1) {
				${iterations}[#i] = ${create_each_block}($$, ${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i));
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

		if (parentNodes && this.renderer.options.hydratable) {
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
		const { dependencies } = this.node.expression;
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
							${iterations}[#i] = ${create_each_block}($$, child_ctx);
							${iterations}[#i].c();
						}
						${iterations}[#i].i(${updateMountNode}, ${anchor});
					`
					: deindent`
						if (${iterations}[#i]) {
							${iterations}[#i].p(changed, child_ctx);
						} else {
							${iterations}[#i] = ${create_each_block}($$, child_ctx);
							${iterations}[#i].c();
							${iterations}[#i].m(${updateMountNode}, ${anchor});
						}
					`
				: deindent`
					${iterations}[#i] = ${create_each_block}($$, child_ctx);
					${iterations}[#i].c();
					${iterations}[#i].${mountOrIntro}(${updateMountNode}, ${anchor});
				`;

			const start = this.block.hasUpdateMethod ? '0' : `${iterations}.length`;

			let destroy;

			if (this.block.hasOutros) {
				destroy = deindent`
					@group_outros();
					for (; #i < ${iterations}.length; #i += 1) ${outroBlock}(#i, 1);
				`;
			} else {
				destroy = deindent`
					for (${this.block.hasUpdateMethod ? `` : `#i = ${this.vars.each_block_value}.${length}`}; #i < ${iterations}.length; #i += 1) {
						${iterations}[#i].d(1);
					}
					${iterations}.length = ${this.vars.each_block_value}.${length};
				`;
			}

			const update = deindent`
				${this.vars.each_block_value} = ${snippet};

				for (var #i = ${start}; #i < ${this.vars.each_block_value}.${length}; #i += 1) {
					const child_ctx = ${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i);

					${forLoopBody}
				}

				${destroy}
			`;

			block.builders.update.addBlock(deindent`
				if (${condition}) {
					${update}
				}
			`);
		}

		if (outroBlock) {
			const countdown = block.getUniqueName('countdown');
			block.builders.outro.addBlock(deindent`
				${iterations} = ${iterations}.filter(Boolean);
				const ${countdown} = @callAfter(#outrocallback, ${iterations}.length);
				for (let #i = 0; #i < ${iterations}.length; #i += 1) ${outroBlock}(#i, 0, ${countdown});`
			);
		}

		block.builders.destroy.addBlock(`@destroyEach(${iterations}, detach);`);
	}

	remount(name: string) {
		// TODO consider keyed blocks
		return `for (var #i = 0; #i < ${this.vars.iterations}.length; #i += 1) ${this.vars.iterations}[#i].m(${name}.$$.slotted.default, null);`;
	}
}