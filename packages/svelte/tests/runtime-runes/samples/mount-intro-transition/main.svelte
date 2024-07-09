<script>
	import { mount, unmount } from 'svelte';
	import Component from './Component.svelte';

	let el;
	let instance;

	function intro(animate) {
		if (instance) unmount(instance);

		instance = mount(Component, {
			target: el,
			intro: animate
		});
	}
</script>

<div bind:this={el}></div>

<button onclick={() => intro()}>mount with intro transition</button>
<button onclick={() => intro(false)}>mount without intro transition</button>
