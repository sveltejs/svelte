<script>
	function noop() {}

	let props = {};

	const dynamicTypeValue = "checkbox";
	const dynamicAriaHiddenValue = "false";
	const dynamicRole = "button";
</script>

<!-- should warn -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} aria-hidden="false" />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<section on:click={noop} />
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main on:click={noop} />
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article on:click={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<header on:click={noop} />
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<footer on:click={noop} />

<!-- should not warn -->
<div class="foo" />

<a href="http://x.y.z" on:click={noop}>foo</a>
<button on:click={noop} />
<select on:click={noop} />

<input type="button" on:click={noop} />
<input type={dynamicTypeValue} on:click={noop} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} {...props} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keydown={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keyup={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keypress={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keydown={noop} on:keyup={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keyup={noop} on:keypress={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keypress={noop} on:keydown={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} on:keydown={noop} on:keyup={noop} on:keypress={noop} />

<input on:click={noop} type="hidden" />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} aria-hidden />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} aria-hidden="true" />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} aria-hidden="false" on:keydown={noop} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={noop} aria-hidden={dynamicAriaHiddenValue} />

<div on:click={noop} role="presentation" />
<div on:click={noop} role="none" />
<div on:click={noop} role={dynamicRole} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element this={Math.random() ? 'button' : 'div'} on:click={noop} />
