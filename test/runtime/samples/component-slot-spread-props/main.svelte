<script>
	import Nested from './Nested.svelte';
	export let value = '';
</script>

<Nested class="foo">
	<input bind:value />
</Nested>
