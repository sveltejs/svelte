<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things} let:thing="{{ num }}">
	<span>{num}</span>
</Nested>