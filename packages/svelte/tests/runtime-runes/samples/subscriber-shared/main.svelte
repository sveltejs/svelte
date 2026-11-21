<script lang="ts">
	import { createSubscriber } from 'svelte/reactivity';

	let first = $state(true);
	let second = $state(true);
	let value = 0;
	let update: () => void;
	const subscribe = createSubscriber((invalidate) => {
		update = invalidate;
		console.log('start');
		return () => console.log('stop');
	});

	function read() {
		subscribe();
		return value;
	}
</script>

<button onclick={() => {
	value++;
	update();
}}>update</button>
<button onclick={() => (first = !first)}>first</button>
<button onclick={() => (second = !second)}>second</button>

{#if first}
	<output>{read()} {read()}</output>
{/if}
{#if second}
	<output>{read()}</output>
{/if}
