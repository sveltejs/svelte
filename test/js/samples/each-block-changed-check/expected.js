import {
	HtmlTag,
	SvelteComponent,
	append,
	attr,
	destroy_each,
	detach,
	element,
	init,
	insert,
	noop,
	safe_not_equal,
	set_data,
	space,
	text
} from "svelte/internal";

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.comment = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function create_each_block(ctx) {
	let div;
	let strong;
	let t0;
	let t1;
	let span;

	let t2_fn = ctx => `
			${ctx.comment.author} wrote ${ctx.elapsed(ctx.comment.time, ctx.time)} ago:
		`;

	let t2_value = t2_fn(ctx);
	let t2;
	let t3;
	let html_tag;
	let raw_fn = ctx => ctx.comment.html + "";
	let raw_value = raw_fn(ctx);

	return {
		c() {
			div = element("div");
			strong = element("strong");
			t0 = text(ctx.i + "");
			t1 = space();
			span = element("span");
			t2 = text(t2_value);
			t3 = space();
			attr(span, "class", "meta");
			html_tag = new HtmlTag(raw_value, null);
			attr(div, "class", "comment");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, strong);
			append(strong, t0);
			append(div, t1);
			append(div, span);
			append(span, t2);
			append(div, t3);
			html_tag.m(div);
		},
		p(changed, ctx) {
			if ((changed.comments || changed.elapsed || changed.time) && t2_value !== (t2_value = t2_fn(ctx))) set_data(t2, t2_value);
			if (changed.comments && raw_value !== (raw_value = raw_fn(ctx))) html_tag.p(raw_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment(ctx) {
	let t0;
	let p;
	let t1;
	let each_value = ctx.comments;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			p = element("p");
			t1 = text(ctx.foo + "");
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, t0, anchor);
			insert(target, p, anchor);
			append(p, t1);
		},
		p(changed, ctx) {
			if (changed.comments || changed.elapsed || changed.time) {
				each_value = ctx.comments;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(t0.parentNode, t0);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (changed.foo) set_data(t1, ctx.foo + "");
		},
		i: noop,
		o: noop,
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(t0);
			if (detaching) detach(p);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { comments } = $$props;
	let { elapsed } = $$props;
	let { time } = $$props;
	let { foo } = $$props;

	$$self.$set = $$props => {
		if ("comments" in $$props) $$invalidate("comments", comments = $$props.comments);
		if ("elapsed" in $$props) $$invalidate("elapsed", elapsed = $$props.elapsed);
		if ("time" in $$props) $$invalidate("time", time = $$props.time);
		if ("foo" in $$props) $$invalidate("foo", foo = $$props.foo);
	};

	return { comments, elapsed, time, foo };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			comments: 0,
			elapsed: 0,
			time: 0,
			foo: 0
		});
	}
}

export default Component;