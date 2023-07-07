<script>
	import Inner from './inner.svelte';
</script>

<Inner content="<p>invalid</p>" />

<p>{@html '<p>invalid</p>'}</p>
