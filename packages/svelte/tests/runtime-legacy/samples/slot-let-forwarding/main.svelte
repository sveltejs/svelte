<script>
	import Outer from './outer.svelte';
</script>

<Outer>
	<div slot="x" let:foo>
		{foo}
	</div>
</Outer>
