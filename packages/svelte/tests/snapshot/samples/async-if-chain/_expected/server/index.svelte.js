import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_if_chain($$renderer) {
	function complex1() {
		return 1;
	}

	let foo = true;
	var blocking;
	var $$promises = $$renderer.run([async () => blocking = await foo]);

	$$renderer.async_block([$$promises[0]], ($$renderer) => {
		if (foo) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`foo`);
		} else if (bar) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`bar`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`else`);
		}
	});

	$$renderer.push(`<!--]--> `);

	$$renderer.async_block([$$promises[0]], async ($$renderer) => {
		if ((await $.save(foo))()) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`foo`);
		} else if (bar) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`bar`);
		} else {
			$$renderer.push('<!--[!-->');

			$$renderer.child_block(async ($$renderer) => {
				if ((await $.save(baz))()) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`baz`);
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push(`else`);
				}
			});

			$$renderer.push(`<!--]-->`);
		}
	});

	$$renderer.push(`<!--]--> `);

	$$renderer.async_block([$$promises[0]], async ($$renderer) => {
		if ((await $.save(foo))() > 10) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`foo`);
		} else if (bar) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`bar`);
		} else {
			$$renderer.push('<!--[!-->');

			$$renderer.async_block([$$promises[0]], async ($$renderer) => {
				if ((await $.save(foo))() > 5) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`baz`);
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push(`else`);
				}
			});

			$$renderer.push(`<!--]-->`);
		}
	});

	$$renderer.push(`<!--]--> `);

	if (simple1) {
		$$renderer.push('<!--[-->');
		$$renderer.push(`foo`);
	} else if (simple2 > 10) {
		$$renderer.push('<!--[1-->');
		$$renderer.push(`bar`);
	} else if (complex1() * complex2 > 100) {
		$$renderer.push('<!--[2-->');
		$$renderer.push(`baz`);
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push(`else`);
	}

	$$renderer.push(`<!--]--> `);

	$$renderer.async_block([$$promises[0]], ($$renderer) => {
		if (blocking > 10) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`foo`);
		} else if (blocking > 5) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`bar`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`else`);
		}
	});

	$$renderer.push(`<!--]-->`);
}