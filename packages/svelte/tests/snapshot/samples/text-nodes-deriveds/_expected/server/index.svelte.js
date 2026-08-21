import * as $ from 'svelte/internal/server';

export default function Text_nodes_deriveds($$renderer) {
	let count1 = 0;
	let count2 = 0;

	function text1() {
		return count1;
	}

	function text2() {
		return count2;
	}

	$$renderer.push(`<p>${$.escape(text1())}${$.escape(text2())}</p>`);
}