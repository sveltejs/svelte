<script>
	import { flushSync, mount } from 'svelte'
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => show = true}>show</button>

<div {@attach (target) => {
	mount(Child, { target, props: { text: 'hello' }  });
	flushSync();
}}></div>
