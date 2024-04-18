<script>
	import Nested from './Nested.svelte';
	let thing = false;
</script>

<Nested>
	<custom-element>
		<div>
			<div slot='foo'></div>
		</div>
		{#if thing}
			<div slot='bar'></div>
		{/if}
	</custom-element>
</Nested>
