<script lang="ts">
	import { onMount } from 'svelte';

	let count: number = 0;

	interface ITimeoutDestroyer {
		(): void; // send timeout to the void!
	}

	onMount(() => {
		const id = setInterval(() => count++, 1000);
		const clear: ITimeoutDestroyer = () => clearInterval(id);
		return clear;
	});
</script>

<h1>Hello world!</h1>
<div>Counter value: {count}</div>
