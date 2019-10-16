import {
	SvelteComponent,
	append,
	detach,
	element,
	empty,
	init,
	insert,
	noop,
	safe_not_equal,
	space
} from "svelte/internal";

function create_if_block_4(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "a";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_if_block_3(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "b";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_if_block_2(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "c";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_if_block_1(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "d";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_if_block(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "e";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_fragment(ctx) {
	let div;
	let t0;
	let p0;
	let t2;
	let t3;
	let t4;
	let p1;
	let t6;
	let t7;
	let if_block4_anchor;
	let if_block0 = ctx.a && create_if_block_4(ctx);
	let if_block1 = ctx.b && create_if_block_3(ctx);
	let if_block2 = ctx.c && create_if_block_2(ctx);
	let if_block3 = ctx.d && create_if_block_1(ctx);
	let if_block4 = ctx.e && create_if_block(ctx);

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			p0 = element("p");
			p0.textContent = "this can be used as an anchor";
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			t4 = space();
			p1 = element("p");
			p1.textContent = "so can this";
			t6 = space();
			if (if_block3) if_block3.c();
			t7 = space();
			if (if_block4) if_block4.c();
			if_block4_anchor = empty();
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t0);
			append(div, p0);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
			append(div, t3);
			if (if_block2) if_block2.m(div, null);
			append(div, t4);
			append(div, p1);
			append(div, t6);
			if (if_block3) if_block3.m(div, null);
			insert(target, t7, anchor);
			if (if_block4) if_block4.m(target, anchor);
			insert(target, if_block4_anchor, anchor);
		},
		p(changed, ctx) {
			if (ctx.a) {
				if (!if_block0) {
					if_block0 = create_if_block_4(ctx);
					if_block0.c();
					if_block0.m(div, t0);
				} else {

				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.b) {
				if (!if_block1) {
					if_block1 = create_if_block_3(ctx);
					if_block1.c();
					if_block1.m(div, t3);
				} else {

				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.c) {
				if (!if_block2) {
					if_block2 = create_if_block_2(ctx);
					if_block2.c();
					if_block2.m(div, t4);
				} else {

				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (ctx.d) {
				if (!if_block3) {
					if_block3 = create_if_block_1(ctx);
					if_block3.c();
					if_block3.m(div, null);
				} else {

				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (ctx.e) {
				if (!if_block4) {
					if_block4 = create_if_block(ctx);
					if_block4.c();
					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
				} else {

				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (detaching) detach(t7);
			if (if_block4) if_block4.d(detaching);
			if (detaching) detach(if_block4_anchor);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { a } = $$props;
	let { b } = $$props;
	let { c } = $$props;
	let { d } = $$props;
	let { e } = $$props;

	$$self.$set = $$props => {
		if ("a" in $$props) $$invalidate("a", a = $$props.a);
		if ("b" in $$props) $$invalidate("b", b = $$props.b);
		if ("c" in $$props) $$invalidate("c", c = $$props.c);
		if ("d" in $$props) $$invalidate("d", d = $$props.d);
		if ("e" in $$props) $$invalidate("e", e = $$props.e);
	};

	return { a, b, c, d, e };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, ["a", "b", "c", "d", "e"]);
	}
}

export default Component;