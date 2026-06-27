<script module>
	import { createContext, mount } from 'svelte';
	import Child from './Child.svelte';

	/** @type {ReturnType<typeof createContext<string>>} */
	const [get, set, has] = createContext();

	export { get, has };

	function Wrapper(Component) {
		return (...args) => {
			set('hello');
			return Component(...args);
		};
	}
</script>

<div
	{@attach (target) => {
		mount(Wrapper(Child), { target });
	}}
></div>
