<svelte:options
	customElement={{
		shadow: { mode: 'open', customElementRegistry: registry }
	}}
/>

<script module lang="ts">
	import Inner from './inner.svelte';
	import './global-widget.svelte';

	/** has a `value` setter, but is only defined in the scoped registry */
	class ScopedProp extends HTMLElement {
		#value: any;

		get value() {
			return this.#value;
		}

		set value(value) {
			this.#value = value;
			this.textContent = `scoped: ${value}`;
		}
	}

	/** same tag name, different class without a `value` setter, defined in the global registry */
	class GlobalProp extends HTMLElement {}

	const registry = new CustomElementRegistry();
	registry.define('x-prop', ScopedProp);
	// the recipe: components without a `tag` can be defined in any registry through their `element` property
	registry.define('inner-element', Inner.element!);

	customElements.define('x-prop', GlobalProp);

	// expose to the test
	Object.assign(window, { scoped_registry: registry, ScopedProp, GlobalProp });
</script>

<script lang="ts">
	let count = $state(1);
	let text = $state('hello');
	let tag = $state('x-prop');
</script>

<inner-element {count}></inner-element>
<x-prop class="static" value={text}></x-prop>
<svelte:element this={tag} class="dynamic"></svelte:element>
{@html '<x-prop class="html"></x-prop>'}
<button
	onclick={() => {
		text = 'world';
		count += 1;
	}}>change</button
>
