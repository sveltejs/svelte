<script>
	const config = { title: 'hello' };
	const items = ['a', 'b'];
	const circular = {};
	circular.self = circular;
	const props = { config, items, circular, empty: null };
	const style = ['color: red;'];
	let calls = 0;
	function tag() {
		calls += 1;
		return 'x-card';
	}
</script>

<x-card {config} {items} {circular} empty={null} data-zero={0} data-false={false} data-string={'hello'} class={['one', { two: true }]}></x-card>
<x-card {...props} data-zero={0} data-false={false} data-string={'hello'} class={['one', { two: true }]}></x-card>
<p is="x-card" {config} {items}></p>
<p is="x-card" {...props}></p>
<svelte:element this={tag()} {config} {items} />
<svelte:element this={tag()} {...props} />
<svelte:element this={'p'} is="x-card" {config} {items} />
<svelte:element this={'p'} is="x-card" {...props} />
<x-card config={'{"title":"hello"}'} items={'["a","b"]'}></x-card>
<div {config} {items}></div>
<svelte:element this={'div'} {config} {items} />
<svelte:element this={'div'} {...{config, items}} />
<svg><rect is="x-card" {config} {items} /><rect is="x-card" {...{config, items}} /><svelte:element this={'foo-bar'} {config} {items} /></svg>
<p>{calls}</p>
<x-card {style}></x-card>
<x-card {...{ style }}></x-card>
<svelte:element this={'x-card'} {style} />
<svelte:element this={'x-card'} {...{ style }} />
