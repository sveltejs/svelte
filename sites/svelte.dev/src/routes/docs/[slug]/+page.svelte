<script>
	/** @type {import('./$types').PageData}*/
	export let data;

	// $: console.log(data.page.content);
</script>

{@html data.page.content}
