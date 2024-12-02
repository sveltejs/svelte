<script>
	import Inner from './Inner.svelte';
</script>

<svelte:window onclick={() => console.log('window')} />
<svelte:document onclick={() => console.log('document')} />
<svelte:body onclick={() => console.log('body')} />

<Inner />
