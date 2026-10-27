<script>
	import Nested from './Nested.svelte';
	let id = $props.id();
</script>

{id}
<Nested />