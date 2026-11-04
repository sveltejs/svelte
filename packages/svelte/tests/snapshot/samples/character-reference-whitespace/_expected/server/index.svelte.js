import * as $ from 'svelte/internal/server';

export default function Character_reference_whitespace($$renderer) {
	$$renderer.push(`<p><span>Hello,</span><b>world</b></p>`);
}