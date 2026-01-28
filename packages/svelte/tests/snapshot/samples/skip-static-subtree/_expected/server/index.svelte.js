import * as $ from 'svelte/internal/server';

export default function Skip_static_subtree($$renderer, $$props) {
	let { title, content } = $$props;

	$$renderer.push(`<header><nav><a href="/">Home</a> <a href="/away">Away</a></nav></header> <main><h1>${$.escape(title)}</h1> <div class="static"><p>we don't need to traverse these nodes</p></div> <p>or</p> <p>these</p> <p>ones</p> ${$.html(content)} <p>these</p> <p>trailing</p> <p>nodes</p> <p>can</p> <p>be</p> <p>completely</p> <p>ignored</p></main> <cant-skip><custom-elements with="attributes"></custom-elements></cant-skip> <div><input autofocus/></div> <div><source muted/></div> <select>`);

	$$renderer.option({ value: 'a' }, ($$renderer) => {
		$$renderer.push(`a`);
	});

	$$renderer.push(`</select> <img src="..." alt="" loading="lazy"/> <div><img src="..." alt="" loading="lazy"/></div>`);
}