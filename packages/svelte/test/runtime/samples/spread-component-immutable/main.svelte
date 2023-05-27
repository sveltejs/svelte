<script>
	import Widget from './Widget.svelte';

	export let obj;
</script>

<Widget {...obj} x={2} />
