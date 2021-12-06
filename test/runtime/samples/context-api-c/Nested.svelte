<script>
	import { setContext } from 'svelte';

	export let value = '';

	if (value) {
		setContext('test', value);
	}
</script>

<slot></slot>