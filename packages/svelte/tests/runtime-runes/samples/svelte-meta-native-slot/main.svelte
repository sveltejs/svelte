<svelte:options runes={false} />

<output>
	<slot><span>default fallback</span></slot>
	<p>after default slot</p>
	<slot name="named"><em>named fallback</em></slot>
	<strong>after named slot</strong>
</output>
