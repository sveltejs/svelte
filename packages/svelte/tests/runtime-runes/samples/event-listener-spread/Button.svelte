<script>
	let { ...stuff } = $props();
</script>

<button {...stuff} on:click>
	<slot></slot>
</button>
