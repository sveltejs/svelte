<script>
	import Prop from './Prop.svelte';
	import Bare from './Bare.svelte';
	import Rows from './Rows.svelte';

	let __proto__ = $state(1);
</script>

<button onclick={() => (__proto__ += 1)}>{__proto__}</button>
<Prop />
<Prop __proto__={__proto__ * 10} />
<Bare />
<Bare __proto__={7} />
<Rows />
