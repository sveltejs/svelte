<script>
	import Page from './Component.svelte';

	let data = $state({ form: { data: { tags: { first: 1, second: 2 }}}});
</script>
<Page {data} />
