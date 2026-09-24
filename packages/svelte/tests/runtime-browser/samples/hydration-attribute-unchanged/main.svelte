<script>
	import Rename from './Rename.svelte';

	let {
		index = 2,
		focus = -1,
		on = true,
		size = 24,
		label = '2',
		n = 1,
		spread = { disabled: true, hidden: true, tabindex: -1 }
	} = $props();

	let pre = $state(1);
	let post = $state(1);

	$effect.pre(() => {
		pre = 2;
	});

	$effect(() => {
		post = 2;
	});
</script>

<form name="createElement"><input /></form>
<object title="named later"></object>
<div data-n={1}></div>
<Rename step="both" />
<p data-n={1}></p>
<Rename step="object" />
<span data-n={1}></span>

<div
	role="row"
	aria-rowindex={index}
	data-active={on}
	data-label={label}
	data-n={n}
	data-pre={pre}
	data-post={post}
></div>
<a href="#top" tabindex={focus}>x</a>
<svg width={size} height={size} stroke-width={1.5} viewBox="0 0 24 24"></svg>
<button {...spread}>x</button>

<div id="local-name" data-n={1}><input /></div>
<form data-n={1}><input name="localName" /></form>
<form data-n={1}><input id="localName" /></form>
<form data-n={1}><input name="namespaceURI" /></form>

<xmlns data-n={1}>x</xmlns>
<xmlns:ab data-n={1}>x</xmlns:ab>
<svg><xmlns data-n={1}></xmlns></svg>
