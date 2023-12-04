<script>
	import Sub from './sub.svelte'

	let count = $state(0);
	let onclick = $state(() => count++);
</script>

<Sub {onclick} increment={onclick} {count} />

<button onclick={() => {
	onclick = () => count--;
}}>change handler</button>
