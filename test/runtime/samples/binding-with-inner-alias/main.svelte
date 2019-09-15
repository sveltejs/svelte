<script>
	import Component from './component.svelte';

	let name = 'john';
	let color = 'blue';
</script>

<Component bind:name bind:color />
<p>bound name is {name}</p>
<p>bound color is {color}</p>
