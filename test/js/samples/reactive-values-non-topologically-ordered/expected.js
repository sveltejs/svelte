import { SvelteComponent, init, safe_not_equal } from "svelte/internal";

function instance($$self, $$props, $$invalidate) {
	let { x } = $$props;
	let a;
	let b;

	$$self.$set = $$props => {
		if ("x" in $$props) $$invalidate("x", x = $$props.x);
	};

	$$self.$$.update = (changed = { x: 1, b: 1 }) => {
		if (changed.x) {
			$: $$invalidate("b", b = x);
		}

		if (changed.b) {
			$: a = b;
		}
	};

	return { x };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, null, safe_not_equal, { x: 0 });
	}
}

export default Component;