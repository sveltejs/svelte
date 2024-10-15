<script>
	import { run } from 'svelte/legacy';


	import { blah } from './blah.js'
	/** @type {{data: any}} */
	let { data } = $props();

	let bar = $state()

	let { foo } = $derived(data)
	run(() => {
		bar = []
		let baz
	});
</script>