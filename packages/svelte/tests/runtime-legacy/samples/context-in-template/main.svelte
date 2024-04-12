<script>
	import { getContext, setContext } from 'svelte';

	setContext('val', 'hello world')

	const get_val = () => {
		return getContext('val');
	}
</script>

{get_val()}
