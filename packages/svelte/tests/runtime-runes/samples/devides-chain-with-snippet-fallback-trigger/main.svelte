<script>
	let show = $state(true);
	let data = $state({ value: 0 });
	let override = $state(null);

	let derived1 = $derived(override ?? data.value);
	let derived2 = $derived(derived1);

	function step1() {
		show = false;
		data = { value: 0 };
	}

	function step2() {
		show = true;
	}

	function step3() {
		override = 1;
		override = 2;
	}
</script>

<button id="step1" onclick={step1}>step1</button>
<button id="step2" onclick={step2}>step2</button>
<button id="step3" onclick={step3}>step3</button>

{#snippet dummy(value = 0)}{/snippet}

{#if show}
	<p>{derived2}</p>
	{@render dummy(derived2 ? 0 : 0)}
{/if}
