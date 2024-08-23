<script>
	let { promise } = $props();
</script>

{#await promise}
	pending
{:then value}
	then {value}
{/await}
