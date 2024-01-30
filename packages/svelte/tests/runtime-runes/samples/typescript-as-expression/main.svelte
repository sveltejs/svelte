<script lang="ts">
	let { log } = $props();

	let count = $state(1) as number;
	let double = $derived(count as number * 2) as number;
	let element = null;
	let element_with_state = $state(null);
	let with_state = $state({ foo: 1 });
	let without_state = { foo: 2 };

	$effect(() => {
		log(element.tagName, element_with_state.tagName);
	})
</script>

{count as number} {double as number}

<div bind:this={element as HTMLElement}></div>
<div bind:this={element_with_state as HTMLElement}></div>
<input type="number" bind:value={(with_state as { foo: number }).foo} />
<input type="number" bind:value={(without_state as { foo: number }).foo as number} />
