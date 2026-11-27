<script>
	import { untrack } from 'svelte';

	let rest = $state(undefined);
</script>

<input {...rest} oninput={() => console.log('hi')}>
<!-- after input and inside template so that attribute spread reruns immediately -->
{!rest ? untrack(() => (rest = {})) : false}
