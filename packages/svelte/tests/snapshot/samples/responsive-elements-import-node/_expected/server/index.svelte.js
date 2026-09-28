import * as $ from 'svelte/internal/server';

export default function Responsive_elements_import_node($$renderer) {
	if (true) {
		$$renderer.push(`<!--[0--><img alt=""/>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push(`<!--[0--><picture></picture>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push(`<!--[0--><source/>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push(`<!--[0--><div><img alt=""/></div> <span></span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (true) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
