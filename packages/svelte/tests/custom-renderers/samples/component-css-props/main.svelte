<script>
	import Child from './Child.svelte';

	let color = $state('red');
</script>

<button onclick={() => (color = 'blue')}>change</button>
<button onclick={() => (color = null)}>remove</button>
<Child --color={color} --size="2px" />
