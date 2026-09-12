<script module>
	import { createContext } from 'svelte';

	/** @type {ReturnType<typeof createContext<string>>} */
	const [get, set, has] = createContext();
	/** @type {ReturnType<typeof createContext<string>>} */
	const [, , has_unset] = createContext();

	export { get, has, has_unset };
</script>

<script>
	import Child from './Child.svelte';

	set('hello');
</script>

<Child />
