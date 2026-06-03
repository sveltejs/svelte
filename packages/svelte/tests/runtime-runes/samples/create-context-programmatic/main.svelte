<script module>
	import { createContext, mount } from 'svelte';
	import Child from './Child.svelte';

	/** @type {ReturnType<typeof createContext<string>>} */
	const [get, set] = createContext();

	export { get };

	function Wrapper(Component) {
		return (...args) => {
			set('hello');
			return Component(...args);
		};
	}
</script>

<div {@attach (target) => {
	mount(Wrapper(Child), { target });
}}></div>
