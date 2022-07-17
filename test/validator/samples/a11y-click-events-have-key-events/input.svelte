<script>
	function noop() {}

	let props = {};

	const dynamicTypeValue = "checkbox";
	const dynamicAriaHiddenValue = "false";
	const dynamicRole = "button";
</script>

<!-- should warn -->
<div on:click={noop} />
<div on:click={noop} aria-hidden="false" />

<section on:click={noop} />
<main on:click={noop} />
<article on:click={noop} />
<header on:click={noop} />
<footer on:click={noop} />

<!-- should not warn -->
<div class="foo" />

<a href="http://x.y.z" on:click={noop}>foo</a>
<button on:click={noop} />
<select on:click={noop} />

<input type="button" on:click={noop} />
<input type={dynamicTypeValue} on:click={noop} />

<div on:click={noop} {...props} />
<div on:click={noop} on:keydown={noop} />
<div on:click={noop} on:keyup={noop} />
<div on:click={noop} on:keypress={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} />
<div on:click={noop} on:keyup={noop} on:keypress={noop} />
<div on:click={noop} on:keypress={noop} on:keydown={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} on:keypress={noop} />

<input on:click={noop} type="hidden" />

<div on:click={noop} aria-hidden />
<div on:click={noop} aria-hidden="true" />
<div on:click={noop} aria-hidden="false" on:keydown={noop} />
<div on:click={noop} aria-hidden={dynamicAriaHiddenValue} />

<div on:click={noop} role="presentation" />
<div on:click={noop} role="none" />
<div on:click={noop} role={dynamicRole} />
