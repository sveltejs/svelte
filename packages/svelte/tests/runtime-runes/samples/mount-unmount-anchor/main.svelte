<script>
	import { mount, unmount } from "svelte";
	import Component from "./Component.svelte";

	let target;

	function generate() {
		for (let i = 0; i < 1000; i++) {
			let myInnocentState = $state({text: "hello"})
			const toUnmount = mount(Component, {
					target: target,
					props: myInnocentState,
			});
			unmount(toUnmount);
		}
	}
</script>

<button onclick={generate}>generate</button>
<div bind:this={target}></div>
