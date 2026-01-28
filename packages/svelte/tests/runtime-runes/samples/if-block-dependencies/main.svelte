<script>
	let first = $state(true)
	let second = $state(false)
	let derivedSecond = $derived(second)

	queueMicrotask(() => {
		first = false
	});
</script>

{first} {second}

<button onclick={() => {
	second = true
}}>Toggle</button>

{#if first || derivedSecond}
		first: {first}
		<br />
		second: {derivedSecond}
{/if}
