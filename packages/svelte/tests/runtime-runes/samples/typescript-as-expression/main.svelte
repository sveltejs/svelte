<script lang="ts">
	let count = $state(1) as number;
	let double = $derived(count as number * 2) as number;

	let element = null;
	let with_state = $state({ foo: 1 });
	let without_state = { foo: 2 };
</script>

{count as number} {double as number}

<div bind:this={element as HTMLElement}></div>
<input type="number" bind:value={(with_state as { foo: number }).foo} />
<input type="number" bind:value={(without_state as { foo: number }).foo as number} />
