<script>
	import { getContext } from 'svelte';

	const foo = getContext('foo')
</script>

<button onclick={() => {
	foo.person.name.last = 'T';
}}>mutate</button>
