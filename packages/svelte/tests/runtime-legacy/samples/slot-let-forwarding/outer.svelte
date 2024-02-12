<script>
	import Inner from './inner.svelte';
</script>

<Inner>
	<slot name="x" slot="x" let:foo {foo}>
			{foo}
	</slot>
</Inner>
