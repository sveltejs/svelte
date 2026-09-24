<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	setContext('message', 'hello from context');
</script>

<div>
	<Child />
</div>
