<script>
	import { run } from 'svelte/legacy';


	import { blah } from './blah.js'
	/**
	* @typedef {Object} Props
	* @property {any} data
	*/

	/** @type {Props} */
	let { data } = $props();

	let bar = $state()
	let { foo } = $derived(data)
	run(() => {
		bar = []
		let baz
	});
</script>