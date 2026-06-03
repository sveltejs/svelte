<script>
	import Child from './Child.svelte';
</script>

<div>
	<x></x>
	<Child>
		<y></y>
		{#snippet foo()}
			<v></v>
		{/snippet}
	</Child>
	<z></z>

	<Child>
		<span>
			<n></n>
		</span>
		{#snippet foo()}
			<span>
				<n></n>
			</span>
		{/snippet}
	</Child>
	<m></m>
</div>

<style>
	x + y { color: green; }
	x + v { color: green; }
	x + z { color: green; }
	y + z { color: green; }
	v + z { color: green; }
	:global(.component) + z { color: green; }

	n + m { color: red; }
</style>
