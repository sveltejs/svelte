<script>
	import { mount, onMount, unmount } from 'svelte';
	import { on } from 'svelte/events';
	import Child from './Child.svelte';

	let target;

	onMount(async () => {
		const off = on(document, 'wheel', () => console.log('on'));
		off();

		const child = mount(Child, { target });
		unmount(child);

		await Promise.resolve();
		document.dispatchEvent(new Event('wheel'));
		document.dispatchEvent(new Event('pointerdown'));
	});
</script>

<div bind:this={target}></div>
