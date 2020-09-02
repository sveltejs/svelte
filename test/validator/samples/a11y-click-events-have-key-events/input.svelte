<script>
	function noop() {}

	let props = {};
</script>

<!-- should warn -->
<div on:click={noop} />
<div on:click={noop} aria-hidden="false" />
<div on:click={noop} role={undefined} />

<section on:click={noop} />
<main on:click={noop} />
<article on:click={noop} />
<header on:click={noop} />
<footer on:click={noop} />

<input type="date" on:click={noop} />

<!-- should not warn -->
<div class="foo" />

<a href="http://x.y.z" on:click={noop}>foo</a>
<button on:click={noop} />
<select on:click={noop} />

<input type="button" on:click={noop} />

<div on:click={noop} {...props} />
<div on:click={noop} on:keydown={noop} />
<div on:click={noop} on:keyup={noop} />
<div on:click={noop} on:keypress={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} />
<div on:click={noop} on:keyup={noop} on:keypress={noop} />
<div on:click={noop} on:keypress={noop} on:keydown={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} on:keypress={noop} />

<div on:click={noop} type="hidden" />

<div on:click={noop} aria-hidden />
<div on:click={noop} aria-hidden="true" />
<div on:click={noop} aria-hidden="false" on:keydown={noop} />

<div on:click={noop} role="presentation" />
<div on:click={noop} role="none" />
