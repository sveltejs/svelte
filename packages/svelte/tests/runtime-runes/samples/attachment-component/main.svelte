<script>
	import Child from './Child.svelte';

	let message = $state('one');

	function attachment(message) {
		return (node) => {
			node.textContent = message;
		};
	}
</script>

<button onclick={() => message = 'two'}>update</button>

<Child {@attach attachment(message)} />
