import $renderer from 'my-custom-renderer';
import 'svelte/internal/flags/custom-renderer';
import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

export default function Main($$anchor) {
	var $$pop_renderer = $.push_renderer($renderer);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	Component(node, {});
	$.append($$anchor, fragment);
	$$pop_renderer();
}