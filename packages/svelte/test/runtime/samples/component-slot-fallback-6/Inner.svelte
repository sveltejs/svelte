<script>
	import Foo from './Foo.svelte';
</script>

<Foo>
	<slot>
		{JSON.stringify($$props)}
	</slot>
</Foo>
