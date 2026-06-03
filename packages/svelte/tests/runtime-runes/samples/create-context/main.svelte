<script module>
	import { createContext } from 'svelte';

	/** @type {ReturnType<typeof createContext<string>>} */
	const [get, set] = createContext();

	export { get };
</script>

<script>
	import Child from './Child.svelte';

	set('hello');
</script>

<Child />
