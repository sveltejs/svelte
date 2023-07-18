<script>
	import Component1 from './Component1.svelte'
	import Component2 from './Component2.svelte'

	let reset = false
	export let logs;
</script>

<Component1>
	{#key reset}
		<Component2 {logs} />
	{/key}
</Component1>

<button on:click={() => reset = !reset}>
	Reset!
</button>