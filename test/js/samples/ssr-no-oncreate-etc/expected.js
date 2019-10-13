import { create_ssr_component } from "svelte/internal";
import { onDestroy, onMount } from "svelte";

function preload(input) {
	return output;
}

function swipe(node, callback) {

}

function foo() {
	console.log("foo");
}

const Component = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	onMount(() => {
		console.log("onMount");
	});

	onDestroy(() => {
		console.log("onDestroy");
	});

	return ``;
});

export default Component;
export { preload };