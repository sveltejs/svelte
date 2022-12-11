<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things}>
	<div slot="foo" let:thing>
		<span>{thing}</span>
	</div>
</Nested>