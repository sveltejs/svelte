<script>
	import Nested from './Nested.svelte';
	let thing = false;
</script>

<custom-element>
	<Nested>
		{#if thing}
			<div>
				<div slot='bar' />
			</div>
		{/if}
	</Nested>
</custom-element>