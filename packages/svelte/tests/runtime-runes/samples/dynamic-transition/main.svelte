<script>
	function transition1() {
		console.log('transition 1')
		return {
			tick() {

			}
		}
	}

	function transition2() {
		console.log('transition 2')
		return {
			tick() {

			}
		}
	}

	let toggle = $state(false);
	let toggleTransition = $state(false);

	const derived = $derived(toggleTransition ? transition1 : transition2)
</script>


<button on:click={() => toggle = !toggle}>{toggle}</button>
<button on:click={() => toggleTransition = !toggleTransition}>{toggleTransition}</button>

{#if toggle}<div transition:derived></div>{/if}

