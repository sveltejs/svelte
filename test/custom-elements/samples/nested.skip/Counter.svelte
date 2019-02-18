<svelte:options tag="my-counter"/>

<script>
	export let count = 0;
</script>

<button on:click='{() => count += 1}'>count: {count}</button>
