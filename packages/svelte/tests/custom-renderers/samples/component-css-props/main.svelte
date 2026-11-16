<script>
	import Child from './Child.svelte';

	let color = $state('red');
</script>

<button onclick={() => (color = 'blue')}>change</button>
<Child --color={color} />
