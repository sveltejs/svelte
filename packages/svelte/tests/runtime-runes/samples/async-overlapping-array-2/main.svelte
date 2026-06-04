<script lang="ts">
	let items = $state([1, 2, 3])
	let queue: Array<() => void> = [];

	function push(value: number) {
		return new Promise((fulfil) => {
			queue.push(() => fulfil(value));
		});
	}

	function shift() {
		queue.shift()?.();
	}

	let array = $derived.by(() => {
		console.log('updating');
		return items;
	});

	queueMicrotask(() => {
		shift();
		shift();
		shift();
	});
</script>

<button onclick={() => items = items.map((n) => n + 1)}>increment</button>
<button onclick={shift}>shift</button>

{#each array as item}
	<div>{await push(item)}</div>
{/each}
