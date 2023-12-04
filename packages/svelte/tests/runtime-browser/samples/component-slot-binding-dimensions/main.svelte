<script>
	import Nested from './Nested.svelte';
	export let clientHeight;
</script>

<Nested bind:clientHeight>
	Hello
</Nested>
