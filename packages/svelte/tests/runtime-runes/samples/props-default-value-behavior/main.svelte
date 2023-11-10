<script>
	import Inner from "./inner.svelte";

	let readonly_undefined = $state();
	let readonlyWithDefault_undefined = $state();
	let binding_undefined = $state();
	let bindingWithDefault_undefined = $state();
	let readonly_defined = $state(0);
	let readonlyWithDefault_defined = $state(0);
	let binding_defined = $state(0);
	let bindingWithDefault_defined = $state(0);
	let bind_readonly_undefined = $state();
	let bind_readonlyWithDefault_undefined = $state();
	let bind_binding_undefined = $state();
	let bind_bindingWithDefault_undefined = $state();
	let bind_readonly_defined = $state(0);
	let bind_readonlyWithDefault_defined = $state(0);
	let bind_binding_defined = $state(0);
	let bind_bindingWithDefault_defined = $state(0);
</script>

<p>props undefined:</p>
<Inner
	readonly={readonly_undefined}
	readonlyWithDefault={readonlyWithDefault_undefined}
	binding={binding_undefined}
	bindingWithDefault={bindingWithDefault_undefined}
/>

<p>props defined:</p>
<Inner
	readonly={readonly_defined}
	readonlyWithDefault={readonlyWithDefault_defined}
	binding={binding_defined}
	bindingWithDefault={bindingWithDefault_defined}
/>

<p>bindings undefined:</p>
<Inner
	bind:readonly={bind_readonly_undefined}
	bind:readonlyWithDefault={bind_readonlyWithDefault_undefined}
	bind:binding={bind_binding_undefined}
	bind:bindingWithDefault={bind_bindingWithDefault_undefined}
/>

<p>bindings defined:</p>
<Inner
	bind:readonly={bind_readonly_defined}
	bind:readonlyWithDefault={bind_readonlyWithDefault_defined}
	bind:binding={bind_binding_defined}
	bind:bindingWithDefault={bind_bindingWithDefault_defined}
/>

<p>
	Main:
	readonly_undefined: {readonly_undefined}
	readonlyWithDefault_undefined: {readonlyWithDefault_undefined}
	binding_undefined: {binding_undefined}
	bindingWithDefault_undefined: {bindingWithDefault_undefined}
	readonly_defined: {readonly_defined}
	readonlyWithDefault_defined: {readonlyWithDefault_defined}
	binding_defined: {binding_defined}
	bindingWithDefault_defined: {bindingWithDefault_defined}
	bind_readonly_undefined: {bind_readonly_undefined}
	bind_readonlyWithDefault_undefined: {bind_readonlyWithDefault_undefined}
	bind_binding_undefined: {bind_binding_undefined}
	bind_bindingWithDefault_undefined: {bind_bindingWithDefault_undefined}
	bind_readonly_defined: {bind_readonly_defined}
	bind_readonlyWithDefault_defined: {bind_readonlyWithDefault_defined}
	bind_binding_defined: {bind_binding_defined}
	bind_bindingWithDefault_defined: {bind_bindingWithDefault_defined}
</p>

<button on:click={() => {
	readonly_undefined = 10;
	readonlyWithDefault_undefined = 10;
	binding_undefined = 10;
	bindingWithDefault_undefined = 10;
	readonly_defined = 10;
	readonlyWithDefault_defined = 10;
	binding_defined = 10;
	bindingWithDefault_defined = 10;
	bind_readonly_undefined = 10;
	bind_readonlyWithDefault_undefined = 10;
	bind_binding_undefined = 10;
	bind_bindingWithDefault_undefined = 10;
	bind_readonly_defined = 10;
	bind_readonlyWithDefault_defined = 10;
	bind_binding_defined = 10;
	bind_bindingWithDefault_defined = 10;
}}>set everything to 10</button>

<button on:click={() => {
	readonly_undefined = undefined;
	readonlyWithDefault_undefined = undefined;
	binding_undefined = undefined;
	bindingWithDefault_undefined = undefined;
	readonly_defined = undefined;
	readonlyWithDefault_defined = undefined;
	binding_defined = undefined;
	bindingWithDefault_defined = undefined;
	bind_readonly_undefined = undefined;
	bind_readonlyWithDefault_undefined = undefined;
	bind_binding_undefined = undefined;
	bind_bindingWithDefault_undefined = undefined;
	bind_readonly_defined = undefined;
	bind_readonlyWithDefault_defined = undefined;
	bind_binding_defined = undefined;
	bind_bindingWithDefault_defined = undefined;
}}>set everything to undefined</button>
