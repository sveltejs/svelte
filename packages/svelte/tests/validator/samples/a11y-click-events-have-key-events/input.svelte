<script>
	function noop() {}

	let props = {};

	const dynamicTypeValue = "checkbox";
	const dynamicAriaHiddenValue = "false";
	const dynamicRole = "button";
</script>

<!-- should warn -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} aria-hidden="false"></div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section on:click={noop}></section>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main on:click={noop}></main>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article on:click={noop}></article>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<header on:click={noop}></header>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<footer on:click={noop}></footer>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<footer on:click={noop}></footer>

<!-- should not warn -->
<div class="foo"></div>

<a href="http://x.y.z" on:click={noop}>foo</a>
<button on:click={noop}></button>
<select on:click={noop}></select>

<input type="button" on:click={noop} />
<input type={dynamicTypeValue} on:click={noop} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} {...props}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keydown={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keyup={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keypress={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keydown={noop} on:keyup={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keyup={noop} on:keypress={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keypress={noop} on:keydown={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} on:keydown={noop} on:keyup={noop} on:keypress={noop}></div>

<input on:click={noop} type="hidden" />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} aria-hidden="true"></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} aria-hidden="true"></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} aria-hidden="false" on:keydown={noop}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div on:click={noop} aria-hidden={dynamicAriaHiddenValue}></div>

<div on:click={noop} role="presentation"></div>
<div on:click={noop} role="none"></div>
<div on:click={noop} role={dynamicRole}></div>
<div on:click={noop} role={dynamicRole}></div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element this={Math.random() ? 'button' : 'div'} on:click={noop} />
