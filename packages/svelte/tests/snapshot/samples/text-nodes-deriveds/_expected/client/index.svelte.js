import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

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

	$.reset(p);
	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}${$1 ?? ''}`), [text1, text2]);
	$.append($$anchor, p);
}