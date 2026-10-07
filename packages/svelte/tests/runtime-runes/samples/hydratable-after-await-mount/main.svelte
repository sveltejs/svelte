<script lang="ts">
	import { mount } from 'svelte';
	import Child from './Child.svelte';

	let { environment } = $props();

	await Promise.resolve();

	if (environment === 'browser') {
		const target = document.createElement('div');
		mount(Child, { target });
		console.log(target.textContent);
	}
</script>

<p>parent</p>
