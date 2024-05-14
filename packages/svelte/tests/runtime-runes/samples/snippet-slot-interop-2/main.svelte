<script>
	import Child from './Child.svelte';
</script>

<Child>
	Default
	<p slot="named" let:foo>Named {foo}</p>
</Child>
