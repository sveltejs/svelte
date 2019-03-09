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
		data_length: string,
		view_length: string,
		length: string;
	}

	contextProps: string[];
	indexName: string;

	var = 'each';

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

		const { dependencies } = node.expression;
		block.addDependencies(dependencies);

		this.block = block.child({
			comment: createDebuggingComment(this.node, this.renderer.component),
			name: renderer.component.getUniqueName('create_each_block'),
			key: node.key as string,

			bindings: new Map(block.bindings)
		});

		// TODO this seems messy
		this.block.hasAnimation = this.node.hasAnimation;

		this.indexName = this.node.index || renderer.component.getUniqueName(`${this.node.context}_index`);

		const fixed_length = node.expression.node.type === 'ArrayExpression'
			? node.expression.node.elements.length
			: null;

		// hack the sourcemap, so that if data is missing the bug
		// is easy to find
		let c = this.node.start + 2;
		while (renderer.component.source[c] !== 'e') c += 1;
		renderer.component.code.overwrite(c, c + 4, 'length');

		const each_block_value = renderer.component.getUniqueName(`${this.var}_value`);
		const iterations = block.getUniqueName(`${this.var}_blocks`);

		this.vars = {
			create_each_block: this.block.name,
			each_block_value,
			get_each_context: renderer.component.getUniqueName(`get_${this.var}_context`),
			iterations,
			length: `[✂${c}-${c+4}✂]`,

			// optimisation for array literal
			data_length: fixed_length === null ? `${each_block_value}.[✂${c}-${c+4}✂]` : fixed_length,
			view_length: fixed_length === null ? `${iterations}.[✂${c}-${c+4}✂]` : fixed_length,

			// filled out later
			anchor: null
		};

		node.contexts.forEach(prop => {
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

		this.contextProps = this.node.contexts.map(prop => `child_ctx.${prop.key.name} = list[i]${prop.tail};`);

		if (this.node.has_binding) this.contextProps.push(`child_ctx.${this.vars.each_block_value} = list;`);
		if (this.node.has_binding || this.node.index) this.contextProps.push(`child_ctx.${this.indexName} = i;`);

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

		if (this.block.hasIntroMethod || this.block.hasOutroMethod) {
			block.builders.intro.addBlock(deindent`
				for (var #i = 0; #i < ${this.vars.data_length}; #i += 1) ${this.vars.iterations}[#i].i();
			`);
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

			block.builders.init.addLine(`var ${each_block_else} = null;`);

			// TODO neaten this up... will end up with an empty line in the block
			block.builders.init.addBlock(deindent`
				if (!${this.vars.data_length}) {
					${each_block_else} = ${this.else.block.name}(ctx);
					${each_block_else}.c();
				}
			`);

			block.builders.mount.addBlock(deindent`
				if (${each_block_else}) {
					${each_block_else}.m(${parentNode || '#target'}, null);
				}
			`);

			const initialMountNode = parentNode || `${this.vars.anchor}.parentNode`;

			if (this.else.block.hasUpdateMethod) {
				block.builders.update.addBlock(deindent`
					if (!${this.vars.data_length} && ${each_block_else}) {
						${each_block_else}.p(changed, ctx);
					} else if (!${this.vars.data_length}) {
						${each_block_else} = ${this.else.block.name}(ctx);
						${each_block_else}.c();
						${each_block_else}.m(${initialMountNode}, ${this.vars.anchor});
					} else if (${each_block_else}) {
						${each_block_else}.d(1);
						${each_block_else} = null;
					}
				`);
			} else {
				block.builders.update.addBlock(deindent`
					if (${this.vars.data_length}) {
						if (${each_block_else}) {
							${each_block_else}.d(1);
							${each_block_else} = null;
						}
					} else if (!${each_block_else}) {
						${each_block_else} = ${this.else.block.name}(ctx);
						${each_block_else}.c();
						${each_block_else}.m(${initialMountNode}, ${this.vars.anchor});
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
			iterations,
			view_length
		} = this.vars;

		const get_key = block.getUniqueName('get_key');
		const lookup = block.getUniqueName(`${this.var}_lookup`);

		block.addVariable(iterations, '[]');
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
				${iterations}[#i] = ${lookup}[key] = ${create_each_block}(key, child_ctx);
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			for (#i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].c();
		`);

		if (parentNodes && this.renderer.options.hydratable) {
			block.builders.claim.addBlock(deindent`
				for (#i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].l(${parentNodes});
			`);
		}

		block.builders.mount.addBlock(deindent`
			for (#i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].m(${initialMountNode}, ${anchorNode});
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
			${this.node.hasAnimation && `for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].r();`}
			${iterations} = @updateKeyedEach(${iterations}, changed, ${get_key}, ${dynamic ? '1' : '0'}, ctx, ${this.vars.each_block_value}, ${lookup}, ${updateMountNode}, ${destroy}, ${create_each_block}, ${anchor}, ${this.vars.get_each_context});
			${this.node.hasAnimation && `for (let #i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].a();`}
			${this.block.hasOutros && `@check_outros();`}
		`);

		if (this.block.hasOutros) {
			block.builders.outro.addBlock(deindent`
				for (#i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].o();
			`);
		}

		block.builders.destroy.addBlock(deindent`
			for (#i = 0; #i < ${view_length}; #i += 1) ${iterations}[#i].d(${parentNode ? '' : 'detach'});
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
			data_length,
			view_length,
			anchor
		} = this.vars;

		block.builders.init.addBlock(deindent`
			var ${iterations} = [];

			for (var #i = 0; #i < ${data_length}; #i += 1) {
				${iterations}[#i] = ${create_each_block}(${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i));
			}
		`);

		const initialMountNode = parentNode || '#target';
		const updateMountNode = this.getUpdateMountNode(anchor);
		const anchorNode = parentNode ? 'null' : 'anchor';

		block.builders.create.addBlock(deindent`
			for (var #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].c();
			}
		`);

		if (parentNodes && this.renderer.options.hydratable) {
			block.builders.claim.addBlock(deindent`
				for (var #i = 0; #i < ${view_length}; #i += 1) {
					${iterations}[#i].l(${parentNodes});
				}
			`);
		}

		block.builders.mount.addBlock(deindent`
			for (var #i = 0; #i < ${view_length}; #i += 1) {
				${iterations}[#i].m(${initialMountNode}, ${anchorNode});
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
				function ${outroBlock}(i, detach, local) {
					if (${iterations}[i]) {
						if (detach) {
							@on_outro(() => {
								${iterations}[i].d(detach);
								${iterations}[i] = null;
							});
						}

						${iterations}[i].o(local);
					}
				}
			`);
		}

		const condition = Array.from(allDependencies)
			.map(dependency => `changed.${dependency}`)
			.join(' || ');

		const has_transitions = !!(this.block.hasIntroMethod || this.block.hasOutroMethod);

		if (condition !== '') {
			const forLoopBody = this.block.hasUpdateMethod
				? deindent`
					if (${iterations}[#i]) {
						${iterations}[#i].p(changed, child_ctx);
						${has_transitions && `${iterations}[#i].i(1);`}
					} else {
						${iterations}[#i] = ${create_each_block}(child_ctx);
						${iterations}[#i].c();
						${has_transitions && `${iterations}[#i].i(1);`}
						${iterations}[#i].m(${updateMountNode}, ${anchor});
					}
				`
				: deindent`
					${iterations}[#i] = ${create_each_block}(child_ctx);
					${iterations}[#i].c();
					${has_transitions && `${iterations}[#i].i(1);`}
					${iterations}[#i].m(${updateMountNode}, ${anchor});
				`;

			const start = this.block.hasUpdateMethod ? '0' : `${view_length}`;

			let remove_old_blocks;

			if (this.block.hasOutros) {
				remove_old_blocks = deindent`
					@group_outros();
					for (; #i < ${view_length}; #i += 1) ${outroBlock}(#i, 1, 1);
					@check_outros();
				`;
			} else {
				remove_old_blocks = deindent`
					for (${this.block.hasUpdateMethod ? `` : `#i = ${this.vars.each_block_value}.${length}`}; #i < ${view_length}; #i += 1) {
						${iterations}[#i].d(1);
					}
					${view_length} = ${this.vars.each_block_value}.${length};
				`;
			}

			const update = deindent`
				${this.vars.each_block_value} = ${snippet};

				for (var #i = ${start}; #i < ${this.vars.each_block_value}.${length}; #i += 1) {
					const child_ctx = ${this.vars.get_each_context}(ctx, ${this.vars.each_block_value}, #i);

					${forLoopBody}
				}

				${remove_old_blocks}
			`;

			block.builders.update.addBlock(deindent`
				if (${condition}) {
					${update}
				}
			`);
		}

		if (outroBlock) {
			block.builders.outro.addBlock(deindent`
				${iterations} = ${iterations}.filter(Boolean);
				for (let #i = 0; #i < ${view_length}; #i += 1) ${outroBlock}(#i, 0);`
			);
		}

		block.builders.destroy.addBlock(`@destroyEach(${iterations}, detach);`);
	}
}