import Wrapper from "./shared/Wrapper";
import Renderer from "../Renderer";
import Block from "../Block";
import EachBlock from "../../nodes/EachBlock";
import KeyBlock from "../../nodes/KeyBlock";
import create_debugging_comment from "./shared/create_debugging_comment";
import FragmentWrapper from "./Fragment";
import { b, x } from "code-red";
import { Identifier } from "estree";

export default class KeyBlockWrapper extends Wrapper {
	node: KeyBlock;
	fragment: FragmentWrapper;
	block: Block;
	dependencies: string[];
	var: Identifier = { type: "Identifier", name: "key_block" };

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: EachBlock,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannot_use_innerhtml();
		this.not_static_content();

		this.dependencies = node.expression.dynamic_dependencies();

		this.block = block.child({
			comment: create_debugging_comment(node, renderer.component),
			name: renderer.component.get_unique_name("create_key_block"),
			type: "key"
		});

		this.fragment = new FragmentWrapper(
			renderer,
			this.block,
			node.children,
			parent,
			strip_whitespace,
			next_sibling
		);

		renderer.blocks.push(this.block);
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		this.fragment.render(
			this.block,
			null,
			(x`#nodes` as unknown) as Identifier
		);

		const has_transitions = !!(
			this.block.has_intro_method || this.block.has_outro_method
		);
		const dynamic = this.block.has_update_method;

		block.chunks.init.push(b`
			let ${this.var} = ${this.block.name}(#ctx);
		`);
		block.chunks.create.push(b`${this.var}.c();`);
		if (this.renderer.options.hydratable) {
			block.chunks.claim.push(b`${this.var}.l(${parent_nodes});`);
		}
		block.chunks.mount.push(
			b`${this.var}.m(${parent_node || "#target"}, ${
				parent_node ? "null" : "#anchor"
			});`
		);
		const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);

		if (this.dependencies.length) {
			const body = b`
				${
					has_transitions
						? b`
							@group_outros();
							@transition_out(${this.var}, 1, 1, @noop);
							@check_outros();
						`
						: b`${this.var}.d(1);`
				}
				${this.var} = ${this.block.name}(#ctx);
				${this.var}.c();
				${has_transitions && b`@transition_in(${this.var})`}
				${this.var}.m(${this.get_update_mount_node(anchor)}, ${anchor});
			`;

			if (dynamic) {
				block.chunks.update.push(b`
					if (${this.renderer.dirty(this.dependencies)}) {
						${body}
					} else {
						${this.var}.p(#ctx, #dirty);
					}
				`);
			} else {
				block.chunks.update.push(b`
					if (${this.renderer.dirty(this.dependencies)}) {
						${body}
					}
				`);
			}
		} else if (dynamic) {
			block.chunks.update.push(b`${this.var}.p(#ctx, #dirty);`);
		}

		if (has_transitions) {
			block.chunks.intro.push(b`@transition_in(${this.var})`);
			block.chunks.outro.push(b`@transition_out(${this.var})`);
		}

		block.chunks.destroy.push(b`${this.var}.d(detaching)`);
	}
}
