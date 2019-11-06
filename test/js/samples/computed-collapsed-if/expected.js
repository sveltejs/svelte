import { SvelteComponent, init, safe_not_equal } from "svelte/internal";

function instance($$self, $$props, $$invalidate) {
	let { x } = $$props;

	function a() {
		return x * 2;
	}

	function b() {
		return x * 3;
	}

	$$self.$set = $$props => {
		if ("x" in $$props) $$invalidate("x", x = $$props.x);
	};

	return { x, a, b };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, null, safe_not_equal, { x: 0, a: 0, b: 0 });
	}

	get a() {
		return this.$$.ctx.a;
	}

	get b() {
		return this.$$.ctx.b;
	}
}

export default Component;