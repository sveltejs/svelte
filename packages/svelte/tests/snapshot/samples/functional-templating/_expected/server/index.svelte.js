import * as $ from 'svelte/internal/server';

export default function Functional_templating($$payload) {
	$$payload.out += `<h1>hello</h1> <div class="potato"><p>child element</p> <p>another child element</p></div>`;
}