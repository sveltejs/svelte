<script>
	import { mount } from 'svelte';
	import Child from './Child.svelte';

	let { count } = $props();

	let iframe;

	$effect(() => {
		mount(Child, {
			target: iframe.contentWindow.document.body,
			props: {
				count
			}
		});
	});
</script>

<iframe title="container" bind:this={iframe}></iframe>
