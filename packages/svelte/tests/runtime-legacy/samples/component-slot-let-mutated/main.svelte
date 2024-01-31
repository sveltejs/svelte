<script>
	import Nested from './Nested.svelte';

	let things = [{ text: 'hello' }];
</script>

<button on:click={() => things[0].text = 'bye'}>mutate</button>
<Nested {things} let:thing>
	<span>{thing.text}</span>
</Nested>
