<script>
	import Outer from './Outer.svelte';

	export let text = 'one';
</script>

<Outer>
	{text}
</Outer>