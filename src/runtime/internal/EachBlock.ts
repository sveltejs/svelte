import { destroy_each } from './dom';
// import {
// 	transition_in,
// 	transition_out,
// 	group_outros,
// 	check_outros,
// } from './transitions';

type ChangedContext<Context> = {
	[K in keyof Context]: boolean;
};

interface Fragment<Context> {
	/** create */
	c: () => void;

	/** claim */
	l?: (nodes: Array<Node>) => void;

	/** hydrate */
	h?: () => void;

	/** mount */
	m: (target: Node, anchor?: Node | null) => void;

	/** update */
	p?: (changed: ChangedContext<Context>, context: Context) => void;

	/** intro */
	i?: () => void;

	/** outro */
	o?: () => void;

	/** destroy */
	d: (detaching: boolean) => void;
}

type GetEachValue = (context: unknown) => Array<unknown>;
type CreateEachBlock = (context: unknown) => Fragment<unknown>;
type CreateElseBlock = CreateEachBlock;
type CreateChildContext = (
	context: unknown,
	each_value: unknown,
	i: number
) => unknown;

export class EachBlock {
	/** each_blocks */
	private b: Array<Fragment<unknown>>;
	/** else_block */
	private eb: Fragment<unknown> | null = null;
	/** get_each_value */
	private ge: GetEachValue;
	/** create_each_block */
	private e: CreateEachBlock;
	/** create_else_block */
	private ce?: CreateElseBlock;
	/** get_each_context */
	private g: CreateChildContext;

	constructor(
		context: unknown,
		get_each_value: GetEachValue,
		create_each_block: CreateEachBlock,
		get_each_context: CreateChildContext,
		create_else_block: CreateElseBlock
	) {
		this.ge = get_each_value;
		this.e = create_each_block;
		this.g = get_each_context;
		this.ce = create_else_block;

		const each_value = get_each_value(context);
		this.b = [];
		for (let i = 0; i < each_value.length; i += 1) {
			this.b[i] = create_each_block(get_each_context(context, each_value, i));
		}

		if (create_else_block && !each_value.length) {
			this.eb = create_else_block(context);
			// TODO: Why exactly is this here and not in the `create` hook below?
			this.eb.c();
		}
	}

	/** create */
	c() {
		for (const block of this.b) {
			block.c();
		}
		// if (this.eb) {
		// 	this.eb.c();
		// }
	}

	/** claim */
	l(nodes: Array<Node>) {
		for (const block of this.b) {
			if (block.l) {
				block.l(nodes);
			}
		}
	}

	/** mount */
	m(target: Node, anchor?: Node | null) {
		for (const block of this.b) {
			block.m(target, anchor);
		}
		if (this.eb) {
			this.eb.m(target, anchor);
		}
	}

	/** update */
	p(changed: unknown, context: unknown, target: Node, anchor?: Node | null) {
		const each_value = this.ge(context);
		const each_blocks = this.b;

		for (let i = 0; i < each_value.length; i += 1) {
			const child_ctx = this.g(context, each_value, i);

			let block = each_blocks[i];
			if (block) {
				if (block.p) {
					block.p(changed, child_ctx);
				}
				// transition_in(block, 1);
			} else {
				block = each_blocks[i] = this.e(child_ctx);
				block.c();
				// transition_in(block, 1);
				block.m(target, anchor);
			}
		}

		// group_outros();
		for (let i = each_value.length; i < each_blocks.length; i += 1) {
			// TODO: make transitions work correctly…
			each_blocks[i].d(true);
			// transition_out(each_blocks[i], 1, 1, () => {
			// 	each_blocks[i] = null;
			// });
		}
		// check_outros();
		each_blocks.length = each_value.length;

		if (this.ce) {
			let else_block = this.eb;
			if (!each_value.length && else_block) {
				if (else_block.p) {
					else_block.p(changed, context);
				}
			} else if (!each_value.length) {
				this.eb = else_block = this.ce(context);
				else_block.c();
				else_block.m(target, anchor);
			} else if (this.eb) {
				this.eb.d(true);
				this.eb = null;
			}
		}
	}

	/** intro */
	i() {
		// for (const block of this.b) {
		// 	transition_in(block);
		// }
	}

	/** outro */
	o() {
		// const blocks = this.b.filter(Boolean);
		// for (const block of blocks) {
		// 	transition_out(block, 0, 0, undefined);
		// }
	}

	/** destroy */
	d(detaching: boolean) {
		destroy_each(this.b, detaching);

		if (this.eb) {
			this.eb.d(detaching);
		}
	}
}
