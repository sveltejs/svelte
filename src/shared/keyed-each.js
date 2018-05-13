import { transitionManager, linear, generateRule, hash } from './transitions';

export function destroyBlock(block, lookup) {
	block.d(1);
	lookup[block.key] = null;
}

export function outroAndDestroyBlock(block, lookup) {
	block.o(function() {
		destroyBlock(block, lookup);
	});
}

export function updateKeyedEach(old_blocks, component, changed, get_key, dynamic, ctx, list, lookup, node, has_outro, create_each_block, intro_method, next, get_context) {
	var o = old_blocks.length;
	var n = list.length;

	var i = o;
	var old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;

	var new_blocks = [];
	var new_lookup = {};
	var deltas = {};

	var i = n;
	while (i--) {
		var child_ctx = get_context(ctx, list, i);
		var key = get_key(child_ctx);
		var block = lookup[key];

		if (!block) {
			block = create_each_block(component, key, child_ctx);
			block.c();
		} else if (dynamic) {
			block.p(changed, child_ctx);
		}

		new_blocks[i] = new_lookup[key] = block;

		if (key in old_indexes) deltas[key] = Math.abs(i - old_indexes[key]);
	}

	var will_move = {};
	var did_move = {};

	var destroy = has_outro ? outroAndDestroyBlock : destroyBlock;

	function insert(block) {
		block[intro_method](node, next);
		lookup[block.key] = block;
		next = block.first;
		n--;
	}

	while (o && n) {
		var new_block = new_blocks[n - 1];
		var old_block = old_blocks[o - 1];
		var new_key = new_block.key;
		var old_key = old_block.key;

		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		}

		else if (!new_lookup[old_key]) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		}

		else if (!lookup[new_key] || will_move[new_key]) {
			insert(new_block);
		}

		else if (did_move[old_key]) {
			o--;

		} else if (deltas[new_key] > deltas[old_key]) {
			did_move[new_key] = true;
			insert(new_block);

		} else {
			will_move[old_key] = true;
			o--;
		}
	}

	while (o--) {
		var old_block = old_blocks[o];
		if (!new_lookup[old_block.key]) destroy(old_block, lookup);
	}

	while (n) insert(new_blocks[n - 1]);

	return new_blocks;
}

export function measure(blocks) {
	const measurements = {};
	let i = blocks.length;
	while (i--) measurements[blocks[i].key] = blocks[i].node.getBoundingClientRect();
	return measurements;
}

export function animate(blocks, rects, fn, params) {
	let i = blocks.length;
	while (i--) {
		const block = blocks[i];
		const from = rects[block.key];

		if (!from) continue;
		const to = block.node.getBoundingClientRect();

		if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) continue;

		const info = fn(block.node, { from, to }, params);

		const duration = 'duration' in info ? info.duration : 300;
		const delay = 'delay' in info ? info.delay : 0;
		const ease = info.easing || linear;
		const start = window.performance.now() + delay;
		const end = start + duration;

		const program = {
			a: 0,
			t: 0,
			b: 1,
			delta: 1,
			duration,
			start,
			end
		};

		const animation = {
			pending: delay ? program : null,
			program: delay ? null : program,
			running: !delay,

			start() {
				if (info.css) {
					const rule = generateRule(program, ease, info.css);
					program.name = `__svelte_${hash(rule)}`;

					transitionManager.addRule(rule, program.name);

					block.node.style.animation = (block.node.style.animation || '')
						.split(', ')
						.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
						.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
						.join(', ');
				}
			},

			update: now => {
				const p = now - program.start;
				const t = program.a + program.delta * ease(p / program.duration);
				if (info.tick) info.tick(t, 1 - t);
			},

			done() {
				if (info.css) {
					transitionManager.deleteRule(block.node, program.name);
				}

				if (info.tick) {
					info.tick(1, 0);
				}

				animation.running = false;
			}
		};

		transitionManager.add(animation);

		if (info.tick) info.tick(0, 1);

		if (!delay) animation.start();
	}
}