import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.template(`<p> </p>`);

export default function Text_nodes_deriveds($$anchor) {
	let count1 = 0;
	let count2 = 0;

	function text1() {
		return count1;
	}

	function text2() {
		return count2;
	}

	var p = root();
	var text = $.child(p);

	text.nodeValue = '00';
	$.reset(p);
	$.append($$anchor, p);
}