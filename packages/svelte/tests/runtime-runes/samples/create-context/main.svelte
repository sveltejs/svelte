<script module>
	import { createContext } from 'svelte';

	const [get, set] = createContext();

	export { get };
</script>

<script>
	import Child from './Child.svelte';

	set('hello');
</script>

<Child />
