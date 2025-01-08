---
title: {#snippet ...}
---

```svelte
<!--- copy: false  --->
{#snippet name()}...{/snippet}
```

```svelte
<!--- copy: false  --->
{#snippet name(param1, param2, paramN)}...{/snippet}
```

Snippets, and [render tags](@render), are a way to create reusable chunks of markup inside your components. Instead of writing duplicative code like [this](/playground/untitled#H4sIAAAAAAAAE5VUYW-kIBD9K8Tmsm2yXXRzvQ-s3eR-R-0HqqOQKhAZb9sz_vdDkV1t000vRmHewMx7w2AflbIGG7GnPlK8gYhFv42JthG-m9Gwf6BGcLbVXZuPSGrzVho8ZirDGpDIhldgySN5GpEMez9kaNuckY1ANJZRamRuu2ZnhEZt6a84pvs43mzD4pMsUDDi8DMkQFYCGdkvsJwblFq5uCik9bmJ4JZwUkv1eoknWigX2eGNN6aGXa6bjV8ybP-X7sM36T58SVcrIIV2xVIaA41xeD5kKqWXuqpUJEefOqVuOkL9DfBchGrzWfu0vb-RpTd3o-zBR045Ga3HfuE5BmJpKauuhbPtENlUF2sqR9jqpsPSxWsMrlngyj3VJiyYjJXb1-lMa7IWC-iSk2M5Zzh-SJjShe-siq5kpZRPs55BbSGU5YPyte4vVV_VfFXxVb10dSLf17pS2lM5HnpPxw4Zpv6x-F57p0jI3OKlVnhv5V9wPQrNYQQ9D_f6aGHlC89fq1Z3qmDkJCTCweOGF4VUFSPJvD_DhreVdA0eu8ehJJ5x91dBaBkpWm3ureCFPt3uzRv56d4kdp-2euG38XZ6dsnd3ZmPG9yRBCrzRUvi-MccOdwz3qE-fOZ7AwAhlrtTUx3c76vRhSwlFBHDtoPhefgHX3dM0PkEAAA=)...

```svelte
{#each images as image}
	{#if image.href}
		<a href={image.href}>
			<figure>
				<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
				<figcaption>{image.caption}</figcaption>
			</figure>
		</a>
	{:else}
		<figure>
			<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
			<figcaption>{image.caption}</figcaption>
		</figure>
	{/if}
{/each}
```

...you can write [this](/playground/untitled#H4sIAAAAAAAAE5VUYW-bMBD9KxbRlERKY4jWfSA02n5H6QcXDmwVbMs-lnaI_z6D7TTt1moTAnPvzvfenQ_GpBEd2CS_HxPJekjy5IfWyS7BFz0b9id0CM62ajDVjBS2MkLjqZQldoBE9KwFS-7I_YyUOPqlRGuqnKw5orY5pVpUduj3mitUln5LU3pI0_UuBp9FjTwnDr9AHETLMSeHK6xiGoWSLi9yYT034cwSRjohn17zcQPNFTs8s153sK9Uv_Yh0-5_5d7-o9zbD-UqCaRWrllSYZQxLw_HUhb0ta-y4NnJUxfUvc7QuLJSaO0a3oh2MLBZat8u-wsPnXzKQvTtVVF34xK5d69ThFmHEQ4SpzeVRediTG8rjD5vBSeN3E5JyHh6R1DQK9-iml5kjzQUN_lSgVU8DhYLx7wwjSvRkMDvTjiwF4zM1kXZ7DlF1eN3A7IG85e-zRrYEjjm0FkI4Cc7Ripm0pHOChexhcWXzreeZyRMU6Mk3ljxC9w4QH-cQZ_b3T5pjHxk1VNr1CDrnJy5QDh6XLO6FrLNSRb2l9gz0wo3S6m7HErSgLsPGMHkpDZK31jOanXeHPQz-eruLHUP0z6yTbpbrn223V70uMXNSpQSZjpL0y8hcxxpNqA6_ql3BQAxlxvfpQ_uT9GrWjQC6iRHM8D0MP0GQsIi92QEAAA=):

```svelte
{#snippet figure(image)}
	<figure>
		<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
		<figcaption>{image.caption}</figcaption>
	</figure>
{/snippet}

{#each images as image}
	{#if image.href}
		<a href={image.href}>
			{@render figure(image)}
		</a>
	{:else}
		{@render figure(image)}
	{/if}
{/each}
```

Like function declarations, snippets can have an arbitrary number of parameters, which can have default values, and you can destructure each parameter. You cannot use rest parameters, however.

## Snippet scope

Snippets can be declared anywhere inside your component. They can reference values declared outside themselves, for example in the `<script>` tag or in `{#each ...}` blocks ([demo](/playground/untitled#H4sIAAAAAAAAE12P0QrCMAxFfyWrwhSEvc8p-h1OcG5RC10bmkyQ0n-3HQPBx3vCPUmCemiDrOpLULYbUdXqTKR2Sj6UA7_RCKbMbvJ9Jg33XpMcW9uKQYEAIzJ3T4QD3LSUDE-PnYA4YET4uOkGMc3W5B3xZrtvbVP9HDas2GqiZHqhMW6Tr9jGbG_oOCMImcUCwrIpFk1FqRyqpRpn0cmjHdAvnrIzuscyq_4nd3dPPD01ukE_NA6qFj9hvMYvGjJADw8BAAA=))...

```svelte
<script>
	let { message = `it's great to see you!` } = $props();
</script>

{#snippet hello(name)}
	<p>hello {name}! {message}!</p>
{/snippet}

{@render hello('alice')}
{@render hello('bob')}
```

...and they are 'visible' to everything in the same lexical scope (i.e. siblings, and children of those siblings):

```svelte
<div>
	{#snippet x()}
		{#snippet y()}...{/snippet}

		<!-- this is fine -->
		{@render y()}
	{/snippet}

	<!-- this will error, as `y` is not in scope -->
	{@render y()}
</div>

<!-- this will also error, as `x` is not in scope -->
{@render x()}
```

Snippets can reference themselves and each other ([demo](/playground/untitled#H4sIAAAAAAAAE2WPTQqDMBCFrxLiRqH1Zysi7TlqF1YnENBJSGJLCYGeo5tesUeosfYH3c2bee_jjaWMd6BpfrAU6x5oTvdS0g01V-mFPkNnYNRaDKrxGxto5FKCIaeu1kYwFkauwsoUWtZYPh_3W5FMY4U2mb3egL9kIwY0rbhgiO-sDTgjSEqSTvIDs-jiOP7i_MHuFGAL6p9BtiSbOTl0GtzCuihqE87cqtyam6WRGz_vRcsZh5bmRg3gju4Fptq_kzQBAAA=)):

```svelte
{#snippet blastoff()}
	<span>🚀</span>
{/snippet}

{#snippet countdown(n)}
	{#if n > 0}
		<span>{n}...</span>
		{@render countdown(n - 1)}
	{:else}
		{@render blastoff()}
	{/if}
{/snippet}

{@render countdown(10)}
```

## Passing snippets to components

Within the template, snippets are values just like any other. As such, they can be passed to components as props ([demo](/playground/untitled#H4sIAAAAAAAAE3VS247aMBD9lZGpBGwDASRegonaPvQL2qdlH5zYEKvBNvbQLbL875VzAcKyj3PmzJnLGU8UOwqSkd8KJdaCk4TsZS0cyV49wYuJuQiQpGd-N2bu_ooaI1YwJ57hpVYoFDqSEepKKw3mO7VDeTTaIvxiRS1gb_URxvO0ibrS8WanIrHUyiHs7Vmigy28RmyHHmKvDMbMmFq4cQInvGSwTsBYWYoMVhCSB2rBFFPsyl0uruTlR3JZCWvlTXl1Yy_mawiR_rbZKZrellJ-5JQ0RiBUgnFhJ9OGR7HKmwVoilXeIye8DOJGfYCgRlZ3iE876TBsZPX7hPdteO75PC4QaIo8vwNPePmANQ2fMeEFHrLD7rR1jTNkW986E8C3KwfwVr8HSHOSEBT_kGRozyIkn_zQveXDL3rIfPJHtUDwzShJd_Qk3gQCbOGLsdq4yfTRJopRuin3I7nv6kL7ARRjmLdBDG3uv1mhuLA3V2mKtqNEf_oCn8p9aN-WYqH5peP4kWBl1UwJzAEPT9U7K--0fRrrWnPTXpCm1_EVdXjpNmlA8G1hPPyM1fKgMqjFHjctXGjLhZ05w0qpDhksGrybuNEHtJnCalZWsuaTlfq6nPaaBSv_HKw-K57BjzOiVj9ZKQYKzQjZodYFqydYTRN4gPhVzTDO2xnma3HsVWjaLjT8nbfwHy7Q5f2dBAAA)):

```svelte
<script>
	import Table from './Table.svelte';

	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 },
		{ name: 'cherries', qty: 20, price: 0.5 }
	];
</script>

{#snippet header()}
	<th>fruit</th>
	<th>qty</th>
	<th>price</th>
	<th>total</th>
{/snippet}

{#snippet row(d)}
	<td>{d.name}</td>
	<td>{d.qty}</td>
	<td>{d.price}</td>
	<td>{d.qty * d.price}</td>
{/snippet}

<Table data={fruits} {header} {row} />
```

Think about it like passing content instead of data to a component. The concept is similar to slots in web components.

As an authoring convenience, snippets declared directly _inside_ a component implicitly become props _on_ the component ([demo](/playground/untitled#H4sIAAAAAAAAE3VSTa_aMBD8Kyu_SkAbCA-JSzBR20N_QXt6vIMTO8SqsY29tI2s_PcqTiB8vaPHs7MzuxuIZgdBMvJLo0QlOElIJZXwJHsLBBvb_XUASc7Mb9Yu_B-hsMMK5sUzvDQahUZPMkJ96aTFfKd3KA_WOISfrFACKmcOMFmk8TWUTjY73RFLoz1C5U4SPWzhrcN2GKDrlcGEWauEnyRwxCaDdQLWyVJksII2uaMWTDPNLtzX5YX8-kgua-GcHJVXI3u5WEPb0d83O03TMZSmfRzOkG1Db7mNacOL19JagVALxoWbztq-H8U6j0SaYp2P2BGbOyQ2v8PQIFMXLKRDk177pq0zf6d8bMrzwBdd0pamyPMb-IjNEzS2f86Gz_Dwf-2F9nvNSUJQ_EOSoTuJNvngqK5v4Pas7n4-OCwlEEJcQTIMO-nSQwtb-GSdsX46e9gbRoP9yGQ11I0rEuycunu6PHx1QnPhxm3SFN15MOlYEFJZtf0dUywMbwZOeBGsrKNLYB54-1R9WNqVdki7usim6VmQphf7mnpshiQRhNAXdoOfMyX3OgMlKtz0cGEcF27uLSul3mewjPjgOOoDukxjPS9rqfh0pb-8zs6aBSt_7505aZ7B9xOi0T9YKW4UooVsr0zB1BTrWQJ3EL-oWcZ572GxFoezCk37QLe3897-B2i2U62uBAAA)):

```svelte
<!-- this is semantically the same as the above -->
<Table data={fruits}>
	{#snippet header()}
		<th>fruit</th>
		<th>qty</th>
		<th>price</th>
		<th>total</th>
	{/snippet}

	{#snippet row(d)}
		<td>{d.name}</td>
		<td>{d.qty}</td>
		<td>{d.price}</td>
		<td>{d.qty * d.price}</td>
	{/snippet}
</Table>
```

Any content inside the component tags that is _not_ a snippet declaration implicitly becomes part of the `children` snippet ([demo](/playground/untitled#H4sIAAAAAAAAE3WOQQrCMBBFrzIMggql3ddY1Du4si5sOmIwnYRkFKX07lKqglqX8_7_w2uRDw1hjlsWI5ZqTPBoLEXMdy3K3fdZDzB5Ndfep_FKVnpWHSKNce1YiCVijirqYLwUJQOYxrsgsLmIOIZjcA1M02w4n-PpomSVvTclqyEutDX6DA2pZ7_ABIVugrmEC3XJH92P55_G39GodCmWBFrQJ2PrQAwdLGHig_NxNv9xrQa1dhWIawrv1Wzeqawa8953D-8QOmaEAQAA)):

```svelte
<!--- file: App.svelte --->
<Button>click me</Button>
```

```svelte
<!--- file: Button.svelte --->
<script>
	let { children } = $props();
</script>

<!-- result will be <button>click me</button> -->
<button>{@render children()}</button>
```

> [!NOTE] Note that you cannot have a prop called `children` if you also have content inside the component — for this reason, you should avoid having props with that name

You can declare snippet props as being optional. You can either use optional chaining to not render anything if the snippet isn't set...

```svelte
<script>
    let { children } = $props();
</script>

{@render children?.()}
```

...or use an `#if` block to render fallback content:

```svelte
<script>
    let { children } = $props();
</script>

{#if children}
    {@render children()}
{:else}
    fallback content
{/if}
```

## Typing snippets

Snippets implement the `Snippet` interface imported from `'svelte'`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
	}

	let { data, children, row }: Props = $props();
</script>
```

With this change, red squigglies will appear if you try and use the component without providing a `data` prop and a `row` snippet. Notice that the type argument provided to `Snippet` is a tuple, since snippets can have multiple parameters.

We can tighten things up further by declaring a generic, so that `data` and `row` refer to the same type:

```svelte
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		data,
		children,
		row
	}: {
		data: T[];
		children: Snippet;
		row: Snippet<[T]>;
	} = $props();
</script>
```

## Exporting snippets

Snippets declared at the top level of a `.svelte` file can be exported from a `<script module>` for use in other components, provided they don't reference any declarations in a non-module `<script>` (whether directly or indirectly, via other snippets) ([demo](/playground/untitled#H4sIAAAAAAAAE3WPwY7CMAxEf8UyB1hRgdhjl13Bga8gHFJipEqtGyUGFUX5dxJUtEB3b9bYM_MckHVLWOKut50TMuC5tpbEY4GnuiGP5T6gXG0-ykLSB8vW2oW_UCNZq7Snv_Rjx0Kc4kpc-6OrrfwoVlK3uQ4CaGMgwsl1LUwXy0f54J9-KV4vf20cNo7YkMu22aqAz4-oOLUI9YKluDPF4h_at-hX5PFyzA1tZ84N3fGpf8YfUU6GvDumLqDKmEqCjjCHUEX4hqDTWCU5PJ6Or38c4g1cPu9tnAEAAA==)):

```svelte
<script module>
	export { add };
</script>

{#snippet add(a, b)}
	{a} + {b} = {a + b}
{/snippet}
```

> [!NOTE]
> This requires Svelte 5.5.0 or newer

## Programmatic snippets

Snippets can be created programmatically with the [`createRawSnippet`](svelte#createRawSnippet) API. This is intended for advanced use cases.

## Snippets and slots

In Svelte 4, content can be passed to components using [slots](legacy-slots). Snippets are more powerful and flexible, and as such slots are deprecated in Svelte 5.
