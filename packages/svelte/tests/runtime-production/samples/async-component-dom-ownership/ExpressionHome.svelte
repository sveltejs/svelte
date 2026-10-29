<script>
	import Fragment from './Fragment.svelte';
</script>

<Fragment value={await Promise.resolve('ready')} />
