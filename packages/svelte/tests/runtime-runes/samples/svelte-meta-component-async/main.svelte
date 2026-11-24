<script>
	import Child from './Child.svelte';
</script>

<h1>title</h1>
<Child />
<p>after</p>
{@html await Promise.resolve('<b>html</b>')}
<i>after html</i>
