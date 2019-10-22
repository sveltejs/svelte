import {
	SvelteComponent,
	append,
	detach,
	element,
	init,
	insert,
	listen,
	noop,
	safe_not_equal,
	set_data,
	text
} from "svelte/internal";

function create_fragment(ctx) {
	let button;

	let t_fn = ctx => `
	Clicked ${ctx.count} ${ctx.count === 1 ? "time" : "times"}
`;

	let t_value = t_fn(ctx);
	let t;
	let dispose;

	return {
		c() {
			button = element("button");
			t = text(t_value);
			dispose = listen(button, "click", ctx.increment);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);
		},
		p(changed, ctx) {
			if (changed.count && t_value !== (t_value = t_fn(ctx))) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let count = 0;

	function increment() {
		$$invalidate("count", count = count + 1);
	}

	return { count, increment };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export default Component;