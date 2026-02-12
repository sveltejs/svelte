<script>
	import Select from './select.svelte';

	let { attrs = { value: ['1'] } } = $props();
</script>

<Select {attrs} />
