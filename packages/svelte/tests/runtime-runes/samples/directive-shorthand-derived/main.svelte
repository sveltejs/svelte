<script>
	let { color = 'red', ...props } = $props();
	let { position = 'relative' } = $derived(props);
	let width = $derived(color === 'red' ? '10px' : '20px');
	let active = $derived(color === 'blue');
</script>

<div class:active style:position style:width></div>
<div class:active style:position style:width {...props}></div>
