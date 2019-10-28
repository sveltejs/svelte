import {
	SvelteComponent,
	attr,
	detach,
	element,
	init,
	insert,
	noop,
	safe_not_equal,
	space
} from "svelte/internal";

function create_fragment(ctx) {
	let div0;
	let t;
	let div1;

	return {
		c() {
			div0 = element("div");
			t = space();
			div1 = element("div");
			attr(div0, "style", ctx.style);
			attr(div1, "style", "" + (ctx.key + ": " + ctx.value));
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t, anchor);
			insert(target, div1, anchor);
		},
		p(changed, ctx) {
			if (changed.style) {
				attr(div0, "style", ctx.style);
			}

			if (changed.key || changed.value) {
				attr(div1, "style", "" + (ctx.key + ": " + ctx.value));
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t);
			if (detaching) detach(div1);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { style } = $$props;
	let { key } = $$props;
	let { value } = $$props;

	$$self.$set = $$props => {
		if ("style" in $$props) $$invalidate("style", style = $$props.style);
		if ("key" in $$props) $$invalidate("key", key = $$props.key);
		if ("value" in $$props) $$invalidate("value", value = $$props.value);
	};

	return { style, key, value };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { style: 0, key: 0, value: 0 });
	}
}

export default Component;