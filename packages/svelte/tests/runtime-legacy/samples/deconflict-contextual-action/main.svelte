<script>
	import action from './util.js';
	export let collect;

	function each_action(_, fn) {
		fn('each_action');
	}
	const array = [each_action];
</script>

<div use:action={collect}></div>

<ul>
	{#each array as action}
		<div use:action={collect}></div>
	{/each}
</ul>
