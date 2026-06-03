---
title: {@attach ...}
tags: attachments
---

Attachments are functions that run in an [effect]($effect) when an element is mounted to the DOM or when [state]($state) read inside the function updates.

Optionally, they can return a function that is called before the attachment re-runs, or after the element is later removed from the DOM.

> [!NOTE]
> Attachments are available in Svelte 5.29 and newer.

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/attachments').Attachment} */
	function myAttachment(element) {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	}
</script>

<div {@attach myAttachment}>...</div>
```

An element can have any number of attachments.

## Attachment factories

A useful pattern is for a function, such as `tooltip` in this example, to _return_ an attachment ([demo](/playground/untitled#H4sIAAAAAAAAE3VT0XLaMBD8lavbDiaNCUlbHhTItG_5h5AH2T5ArdBppDOEMv73SkbGJGnH47F9t3un3TsfMyO3mInsh2SW1Sa7zlZKo8_E0zHjg42pGAjxBPxp7cTvUHOMldLjv-IVGUbDoUw295VTlh-WZslqa8kxsLL2ACtHWxh175NffnQfAAGikSGxYQGfPEvGfPSIWtOH0TiBVo2pWJEBJtKhQp4YYzjG9JIdcuMM5IZqHMPioY8vOSA997zQoevf4a7heO7cdp34olRiTGr07OhwH1IdoO2A7dLMbwahZq6MbRhKZWqxk7rBxTGVbuHmhCgb5qDgmIx_J6XtHHukHTrYYqx_YpzYng8aO4RYayql7hU-1ZJl0akqHBE_D9KLolwL-Dibzc7iSln9XjtqTF1UpMkJ2EmXR-BgQErsN4pxIJKr0RVO1qrxAqaTO4fbc9bKulZm3cfDY3aZDgvFGErWjmzhN7KmfX5rXyDeX8Pt1mU-hXjdBOrtuB97vK4GPUtmJ41XcRMEGDLD8do0nJ73zhUhSlyRw0t3vPqD8cjfLs-axiFgNBrkUd9Ulp50c-GLxlXAVlJX-ffpZyiSn7H0eLCUySZQcQdXlxj4El0Yv_FZvIKElqqGTruVLhzu7VRKCh22_5toOyxsWqLwwzK-cCbYNdg-hy-p9D7sbiZWUnts_wLUOF3CJgQAAA==)):

```svelte
<!--- file: App.svelte --->
<script>
	import tippy from 'tippy.js';

	let content = $state('Hello!');

	/**
	 * @param {string} content
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function tooltip(content) {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<button {@attach tooltip(content)}>
	Hover me
</button>
```

Since the `tooltip(content)` expression runs inside an [effect]($effect), the attachment will be destroyed and recreated whenever `content` changes. The same thing would happen for any state read _inside_ the attachment function when it first runs. (If this isn't what you want, see [Controlling when attachments re-run](#Controlling-when-attachments-re-run).)

## Inline attachments

Attachments can also be created inline ([demo](/playground/untitled#H4sIAAAAAAAAE71Wf3OaWBT9KoyTTnW3MS-I3dYmnWXVtnRAazRJzbozRSQEApiRhwKO333vuY8m225m_9yZGOT9OPfcc84D943UTfxGr_G7K6Xr3TVeNW7D2M8avT_3DVk-YAoDNF4vNB8e2tnWjyXGlm7mPzfurVPpp5JgGmeZtwkf5PtFupCxLzVvHa832rl2lElX-s2Xm2DZFNqp_hs-rZetd4v07ORpT3qmQHu7MF2td0BZp8k6z_xkvfXP902_pZ2_1_aYWEiqm0kN8I4r79qbdZ6umnq3q_2iNf22F4dE6qt2oimwdpim_uY6XMm7Fuo-IQT_iTD_CeGTHwZ38ieIJUFQRxirR1Xf39Dw0X5z0I72Af4tD61vvPNwWKQnqmfPTbduhsEd2J3vO_oBd3dc6fF2X7umNdWGf0vBRhSS6qoV7cCXfTXWfKmvWG61_si_vfU92Wz-E4RhsLhNIYinsox9QKGVd8-tuACCeKXRX12P-T_eKf7fhTq0Hvt-f3ailtSeoxJHRo1-58NoPe1UiBc1hkL8Yeh45y_vQ3mcuNl9T8s3cXPRWLnS7YWJG_gn2Tb4tUjid8jua-PVl08j_ab8I14mH8Llx0s5Tz5Err4ql52r_GYg0mVy1bEGZuD0ze64b5TWYFiM-16wSuJ4JT5vfVpDcztrcG_YkRU4s6HxufzDWF4XuVeJ1P10IbzBemt3Vp1V2e04ZXfrJd7Wicyd039brRIv_RIVu_nXi7X1cfL2sy66ztToUp1TO7qJ7NlwZ0f30pld5qNSVE5o6PbMojFHjgZB7oSicPpGteyLclQap7SvY0dXtM_LR1NT2JFHey3aaxa0VxCeYJ7RMHemoiCcgPZV9pR7o7kgcOjeGliYk9hjDZx8FAq6enwlTPSZj_vYPw9Il64dXdIY8ZmapzwfEd8-1ZyaxWhqkIZOibXUd-6Upqi1pD4uMicCV1GA_7zi73UN8BaF4sC8peJtMjfmjbHZBFwq5ov50qRaE0l96NZggnW4KqypYRAW-uhSz9ADvklwJF2J-5W0Z5fQPBhDX92R6I_0IFxRgDftge4l4dP-gH1hjD7uqU6fsOEZ9UNrCdPB-nys6uXgY6O3ZMd9sy5T9PghqrWHdjo4jB51CgLiKJaDYYA-7WgYONf1FbjkI-mE3EAfUY_rijfuJ_CVPaR50oe9JF7Q0pI8Dw3osxxYHdYPGbp2CnwHF8KvwJv2wEv0Z3ilQI6U9uwbZxbYJXvEmjjQjjCHkvNLvNg3yhzXQd1olamsT4IRrZmX0MUDpwL7R8zzHj7pSh9hPHFSHjLezKqAST51uC5zmtQ87skDUaneLokT5RbXkPWSYz53Abgjc8_o4KFGUZ-Hgv2Z1l5OTYM9D-HfUD0L-EwxH5wRnIG61gS-khfgY1bq7IAP_DA4l5xRuh9xlm8yGjutc8t-wHtkhWv3hc7aqGwiK5KzgvM5xRkZYn193uEln-su55j1GaIv7oM4iPrsVHiG0Dx7TR9-1lBfqFdwfvSd5LNL5xyZVp5NoHFZ57FkfiF6vKs4k5zvIfrX5xX6MXmt0gM5MTu8DjnhukrHHzTRd3jm0dma0_f_x5cxP9f4jBdqHvmbq2fUjzqcKh2Cp-yWj9ntcHanXmBXxhu7Q--eyjhfNFpaV7zgz4nWEUb7zUOhpevjjf_gu_KZ99pxFlZ-T3sttkmYqrco_26q35v0Ewzv5EZPbnL_8BfduWGMnyyN3q0bZ_7hb_7KG_L4CQAA)):

```svelte
<!--- file: App.svelte --->
<canvas
	width={32}
	height={32}
	{@attach (canvas) => {
		const context = canvas.getContext('2d');

		$effect(() => {
			context.fillStyle = color;
			context.fillRect(0, 0, canvas.width, canvas.height);
		});
	}}
></canvas>
```

> [!NOTE]
> The nested effect runs whenever `color` changes, while the outer effect (where `canvas.getContext(...)` is called) only runs once, since it doesn't read any reactive state.

## Conditional attachments

Falsy values like `false` or `undefined` are treated as no attachment, enabling conditional usage:

```svelte
<div {@attach enabled && myAttachment}>...</div>
```

## Passing attachments to components

When used on a component, `{@attach ...}` will create a prop whose key is a [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). If the component then [spreads](/tutorial/svelte/spread-props) props onto an element, the element will receive those attachments.

This allows you to create _wrapper components_ that augment elements ([demo](/playground/untitled#H4sIAAAAAAAAE3VUS3ObMBD-KxvajnFqsJM2PhA7TXrKob31FjITAbKtRkiMtDhJPfz3LiAMdpxhGJvdb1_fPnaeYjn3Iu-WIbJ04028lZDcetHDzsO3olbVApI74F1RhHbLJdayhFl-Sp5qhVwhufEWNjWiwJtYxSjyQhsEFEXxBiujcxg1_8O_dnQ9APwsEbVyiHDafjrvDZCgkiO4MLCEzxYZcn90z6XUZ6OxA61KlaIgV6i1pFC-sxjDrlbHaDiWRoGvdMbHsLzp5DES0mJnRxGaRBvcBHb7yFUTCQeunEWYcYtGv12TqgFUDbCK1WLaM6IWQhUlQiJUFm2ZLPly51xXMG0Rjoyd69C7UqqG2nu95QZyXvtvLVpri2-SN4hoLXXCZFfhQ8aQBU1VgdEaH_vSgyBZR_BpPp_vi0tY-rw2ulRZkGqpTQRbZvwa2BPgFC8bgbw31CbjJjAsE6WNYBZeGp7vtQXLMqHWnZx-5kM1TR5ycpkZXQR2wzL94l8Ur1C_3-g168SfQf1MyfRi3LW9fs77emJEw5QV9SREoLTq06tcczq7d6xEUcJX2vAhO1b843XK34e5unZEMBr15ekuKEusluWAF8lXhE2ZTP2r2RcIHJ-163FPKerCgYJLOB9i4GvNwviI5-gAQiFFBk3tBTOU3HFXEk0R8o86WvUD64aINhv5K3oRmpJXkw8uxMG6Hh6JY9X7OwGSqfUy9tDG3sHNoEi0d_d_fv9qndxRU0VClFqo3KVo3U655Hnt1PXB3Qra2Y2QGdEwgTAMCxopsoxOe6SD0gD8movDhT0LAnhqlE8gVCpLWnRoV7OJCkFAwEXitrYL1W7p7pbiE_P7XH6E_rihODm5s52XtiH9Ekaw0VgI9exadWL1uoEYjPtg2672k5szsxbKyWB2fdT0w5Y_0hcT8oXOlRetmLS8-g-6TLXXQgYAAA==)):

```svelte
<!--- file: Button.svelte --->
<script>
	/** @type {import('svelte/elements').HTMLButtonAttributes} */
	let { children, ...props } = $props();
</script>

<!-- `props` includes attachments -->
<button {...props}>
	{@render children?.()}
</button>
```

```svelte
<!--- file: App.svelte --->
<script>
	import tippy from 'tippy.js';
	import Button from './Button.svelte';

	let content = $state('Hello!');

	/**
	 * @param {string} content
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function tooltip(content) {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<Button {@attach tooltip(content)}>
	Hover me
</Button>
```

## Controlling when attachments re-run

Attachments, unlike [actions](use), are fully reactive: `{@attach foo(bar)}` will re-run on changes to `foo` _or_ `bar` (or any state read inside `foo`):

```js
// @errors: 7006 2304 2552
function foo(bar) {
	return (node) => {
		veryExpensiveSetupWork(node);
		update(node, bar);
	};
}
```

In the rare case that this is a problem (for example, if `foo` does expensive and unavoidable setup work) consider passing the data inside a function and reading it in a child effect:

```js
// @errors: 7006 2304 2552
function foo(+++getBar+++) {
	return (node) => {
		veryExpensiveSetupWork(node);

+++		$effect(() => {
			update(node, getBar());
		});+++
	}
}
```

## Creating attachments programmatically

To add attachments to an object that will be spread onto a component or element, use [`createAttachmentKey`](svelte-attachments#createAttachmentKey).

## Converting actions to attachments

If you're using a library that only provides actions, you can convert them to attachments with [`fromAction`](svelte-attachments#fromAction), allowing you to (for example) use them with components.
