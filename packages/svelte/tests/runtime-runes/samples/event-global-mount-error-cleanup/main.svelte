<script>
	import { mount, onMount } from 'svelte';
	import Outer from './Outer.svelte';

	let el;

	onMount(() => {
		try {
			mount(Outer, { target: el });
		} catch {}
	});
</script>

<div bind:this={el}></div>
