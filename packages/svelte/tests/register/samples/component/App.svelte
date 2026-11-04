<script lang="ts">
	import { Counter } from './counter.svelte.ts';

	let { name }: { name: string } = $props();

	const counter = new Counter();
	counter.count += 2;
</script>

<h1>Hello {name}! {counter.count} {counter.double}</h1>
