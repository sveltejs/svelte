<!-- valid -->
<button>click me</button>
<button tabindex='0'>click me</button>
<button tabindex='{0}'>click me</button>
<div></div>
<div tabindex='-1'></div>
<div role='button' tabindex='0'></div>
<div role='article' tabindex='-1'></div>
<article tabindex='-1'></article>
<div role="tabpanel" tabindex='0'></div>
<svelte:element this={Math.random() ? 'button' : 'div'} tabindex="0" />
<!-- invalid -->
<div tabindex='0'></div>
<div role='article' tabindex='0'></div>
<article tabindex='0'></article>
<article tabindex='{0}'></article>

<script>
	let { inert = false, onselect } = $props();
</script>

<!-- valid conditional role/tabindex pairs -->
<div role={inert ? 'img' : 'button'} tabindex={inert ? undefined : 0}></div>
<div role={inert ? 'button' : 'img'} tabindex={inert ? 0 : undefined}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? null : '0'}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? -1 : 0}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? '-1' : 0}></div>
<div role="{inert ? 'img' : 'button'}" tabindex="{inert ? undefined : 0}"></div>
<div role={inert ? 'button' : 'link'} tabindex="0"></div>
<div role={inert ? 'img' : 'tabpanel'} tabindex={inert ? undefined : 0}></div>
<div role={inert ? 'img' : 'button'} tabindex="-1"></div>
<div role="img" tabindex={inert ? undefined : -1} aria-label="Chart"></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? undefined : (loading ? -1 : 0)}></div>
<div
	role={inert ? 'img' : 'button'}
	aria-label="Revenue chart"
	tabindex={inert ? undefined : 0}
	onclick={onselect}
	onkeydown={(event) => event.key === 'Enter' && onselect()}
></div>

<!-- invalid or unknown conditional role/tabindex pairs -->
<div role={inert ? 'img' : 'button'} tabindex="0"></div>
<div role={inert ? 'img' : 'button'} tabindex={loading ? undefined : 0}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? 0 : undefined}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? tab_index : 0}></div>
<div role={inert ? 'img' : 'article'} tabindex={inert ? undefined : 0}></div>
<div role={inert ? 'img' : dynamic_role} tabindex={inert ? undefined : 0}></div>
<div role={inert ? 'img' : 'button'} tabindex={inert ? (loading ? undefined : 0) : 0}></div>
<div role={get_inert() ? 'img' : 'button'} tabindex={get_inert() ? undefined : 0}></div>
<div role={state.inert ? 'img' : 'button'} tabindex={state.inert ? undefined : 0}></div>
<div role={inert ? (inert = false, 'img') : 'button'} tabindex={inert ? undefined : 0}></div>
{#each [0] as undefined}
	<div role={inert ? 'img' : 'button'} tabindex={inert ? undefined : 0}></div>
{/each}

<!-- attribute order must not hide mutations between the tests -->
<div tabindex={inert ? undefined : (inert = true, 0)} role={inert ? 'img' : 'button'}></div>
<div role={inert ? 'img' : 'button'} data-change={(inert = false)} tabindex={inert ? undefined : 0}></div>
<div role={inert ? 'img' : 'button'} data-change={get_inert()} tabindex={inert ? undefined : 0}></div>

<!-- reversing pure attributes or adding pure intervening attributes is valid -->
<div tabindex={inert ? -1 : 0} aria-label="Chart {label}" role={inert ? 'img' : 'button'}></div>
<div tabindex={inert ? undefined : (loading ? -1 : 0)} role={inert ? 'img' : 'button'}></div>
