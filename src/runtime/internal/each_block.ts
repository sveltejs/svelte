interface Fragment {
	key: string;

	/** create */
	c: () => void;

	/** claim */
	l?: (nodes: Array<Node>) => void;

	/** hydrate */
	h?: () => void;

	/** mount */
	m: (target: Node, anchor?: Node | null) => void;

	/** update */
	p?: (changed: unknown, context: unknown) => void;

	/** intro */
	i?: () => void;

	/** outro */
	o?: () => void;

	/** destroy */
	d: (detaching: boolean) => void;
}

export interface EachBlock {
	/** each_blocks */
	b: Array<Fragment>;
	/** each_lookup */
	l: Map<unknown, Fragment>;
	/** else_block */
	e: Fragment | null;

	/** get_each_context */
	gc: (context: unknown, each_value: unknown, i: number) => unknown;
	/** get_each_value */
	gv: (context: unknown) => Array<unknown>;
	/** get_key */
	gk?: (child_context: unknown) => string;
	/** create_each_block */
	cb: (context: unknown, key?: unknown) => Fragment;
	/** create_else_block */
	ce?: (context: unknown) => Fragment;
}

export function init_each_block(
	context: unknown,
	get_each_context: EachBlock['gc'],
	get_each_value: EachBlock['gv'],
	get_key: EachBlock['gk'],
	create_each_block: EachBlock['cb'],
	create_else_block: EachBlock['ce']
): EachBlock {
	const each_value = get_each_value(context);
	const each_blocks = [];
	const each_lookup = new Map();

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(context, each_value, i);
		let key = get_key && get_key(child_ctx);
		each_lookup.set(key, (each_blocks[i] = create_each_block(child_ctx, key)));
	}

	let else_block = null;
	if (create_else_block && !each_value.length) {
		else_block = create_else_block(context);
		// TODO: Why exactly is this here and not in the `create` hook?
		else_block.c();
	}

	return {
		b: each_blocks,
		l: each_lookup,
		e: else_block,
		gc: get_each_context,
		gv: get_each_value,
		gk: get_key,
		cb: create_each_block,
		ce: create_else_block,
	};
}

export function create_each_blocks(each_block: EachBlock) {
	for (const block of each_block.b) {
		block.c();
	}
}

export function claim_each_blocks(each_blocks: EachBlock, nodes: Array<Node>) {
	for (const block of each_blocks.b) {
		if (block.l) {
			block.l(nodes);
		}
	}
}

export function mount_each_blocks(
	each_blocks: EachBlock,
	target: Node,
	anchor?: Node | null
) {
	for (const block of each_blocks.b) {
		block.m(target, anchor);
	}
	if (each_blocks.e) {
		each_blocks.e.m(target, anchor);
	}
}

export function destroy_each_blocks(
	each_blocks: EachBlock,
	detaching: boolean
) {
	for (const block of each_blocks.b) {
		if (block) {
			block.d(detaching);
		}
	}

	if (each_blocks.e) {
		each_blocks.e.d(detaching);
	}
}
