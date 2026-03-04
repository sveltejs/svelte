<script>
	class Foo {
		value = $state(0);
		double = $derived(this.value * 2);

		constructor() {
			console.log(this.value, this.double);
		}

		increment() {
			this.value++;
		}
	}

	let foo = $state();

	$effect(() => {
		foo = new Foo();
	});

	let bar = $derived(new Foo());
</script>

<button onclick={() => {foo.increment(); bar.increment()}}>increment</button>

{#if foo}
	<p>{foo.value}/{foo.double}</p>
{/if}

<p>{bar.value}/{bar.double}</p>
