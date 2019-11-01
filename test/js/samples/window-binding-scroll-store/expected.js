import {
	SvelteComponent,
	add_render_callback,
	append,
	component_subscribe,
	detach,
	element,
	init,
	insert,
	listen,
	noop,
	safe_not_equal,
	set_data,
	set_style,
	space,
	text
} from "svelte/internal";

import { writable, derived } from "svelte/store";

function create_fragment(ctx) {
	let scrolling = false;

	let clear_scrolling = () => {
		scrolling = false;
	};

	let scrolling_timeout;
	let p;
	let t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let div;
	let dispose;
	add_render_callback(ctx.onwindowscroll);

	return {
		c() {
			p = element("p");
			t0 = text("scroll y is ");
			t1 = text(ctx.$y);
			t2 = text(". ");
			t3 = text(ctx.$y);
			t4 = text(" * ");
			t5 = text(ctx.$y);
			t6 = text(" = ");
			t7 = text(ctx.$y_squared);
			t8 = space();
			div = element("div");
			set_style(p, "position", "fixed");
			set_style(p, "top", "1em");
			set_style(p, "left", "1em");
			set_style(div, "height", "9999px");

			dispose = listen(window, "scroll", () => {
				scrolling = true;
				clearTimeout(scrolling_timeout);
				scrolling_timeout = setTimeout(clear_scrolling, 100);
				ctx.onwindowscroll();
			});
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t0);
			append(p, t1);
			append(p, t2);
			append(p, t3);
			append(p, t4);
			append(p, t5);
			append(p, t6);
			append(p, t7);
			insert(target, t8, anchor);
			insert(target, div, anchor);
		},
		p(changed, ctx) {
			if (changed.$y && !scrolling) {
				scrolling = true;
				clearTimeout(scrolling_timeout);
				scrollTo(window.pageXOffset, ctx.$y);
				scrolling_timeout = setTimeout(clear_scrolling, 100);
			}

			if (changed.$y) set_data(t1, ctx.$y);
			if (changed.$y) set_data(t3, ctx.$y);
			if (changed.$y) set_data(t5, ctx.$y);
			if (changed.$y_squared) set_data(t7, ctx.$y_squared);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(p);
			if (detaching) detach(t8);
			if (detaching) detach(div);
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $y;
	let $y_squared;
	const y = writable(0);
	component_subscribe($$self, y, value => $$invalidate("$y", $y = value));
	const y_squared = derived(y, $y => $y * $y);
	component_subscribe($$self, y_squared, value => $$invalidate("$y_squared", $y_squared = value));

	function onwindowscroll() {
		y.set($y = window.pageYOffset)
	}

	return {
		y,
		y_squared,
		$y,
		$y_squared,
		onwindowscroll
	};
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export default Component;