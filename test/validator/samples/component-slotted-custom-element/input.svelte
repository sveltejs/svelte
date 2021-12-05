<script>
	import Nested from './Nested.svelte';
	let thing = false;
</script>

<Nested>
	<custom-element>
		<div>
			<div slot='foo' />
		</div>
		{#if thing}
			<div slot='bar' />
		{/if}
	</custom-element>
</Nested>