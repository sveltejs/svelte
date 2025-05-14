---
title: {@attach ...}
---

Attachments are functions that run when an element is mounted to the DOM. Optionally, they can return a function that is called when the element is later removed from the DOM.

> [!NOTE]
> Attachments are available in Svelte 5.29 and newer.

```svelte
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

Since the `tooltip(content)` expression runs inside an [effect]($effect), the attachment will be destroyed and recreated whenever `content` changes.

## Inline attachments

Attachments can also be created inline ([demo](/playground/untitled#H4sIAAAAAAAAE71WbW_aSBD-Kyt0VaBJyGKbqoUkOhdI68qGUkh6pPSDMY6xYwyH12Ab8d9vZtYE6DX38aQQe3fennlm1jvbUmTP3VKj9KcthO3MShelJz9041Ljx7YksiWKcAP2C0V9uazGazcUuDexY_d3-84iEm4kwE3pOnZW_lLcjqOx8OfLxUqwLVvafiTYjj2tFnN2Vr3yVvbUB4NqEJ81x9H11cEounbsaG3HaL_xp2J2s1WVHa5mru_NxMtyW6TAytKgwm5u2RYlYwF4YsEIVSrYDZMaVc8VLblXPlOmZ5UmxkP9P9ynJ9cR5fKxk7EIXQGQIV9wsXL_TtxY6JE_t4W_iO5wv_yURA6uWLhYLMuicrAdi_-2RAMCUGgTReUC8gUTB9mueC2WK1ckq4j9AhVytiPHDX_Fh_-PXBVvhcsdEHl7fSXZkeTHIgtdKp7c3UegUjRYjfM3hQ9ZjpOty407efbF5dyOnxssWYXlcWlqC7sBmDz3Kl575-k8bGIXvdMuvn7uKo_Zx3Ayv_Mnn-7FaH4X2Mo0m6gPyWObR5P5g2q0dc9q6fVeS8uMdifttRxvOg_DKf-ydkEHZBuj_ayZgeFZw472JfuoTb6niZPzyP78jTvtxdpUp-o0q6tWVl87c2dtBfrGan3Ip3Mn-hqkm9Ff3xbGp_6HLwqvWwOtDnFqZvAYmMPOxgyehTW8T7oZzy1fU8yhAXuW6La9xPJ5arW0fNLiWTfTamCnmsED2DlJd6BzM3DA1gBbPQVbDv444Qw6iTXgKfjxwC43B5QbyDzPgrXRNlAm0MZoW0nX5_B06Ak-Mc-k10L7kQe81M3gHvYAz0CvkTwAvC2IOdDT7kADDq0MdSHvxMp0XnAJeXyLrQCx8hTxj3J6L2Igbp5KDIRbSNw6YSPcuDfsI5ac8KI80yFWX0AeitHuox4-pa-BpoEvzKMOOSMfWDeBGIFXwP4gzOE9cu71kF_FEpgf8AF-eYq4wQZ5z8A_2HtUF_LRwjXEaYFvrBnkA7rg00L9pCfjJYjHxNzmG8qbeBlgjndBwT1ypyCG7gtPngcY-aTd8TBPM-h41vfiiX6hjsAT9g3yw4t9ReLGdR_rSjUEOfBDtQRcyKUhSI4cwG_SNlTiD3vou5XiO2IB_zniBhusJeanORnHPpLcU92oZ9F3RjUiTizkDnx2BPUv4KK6Qc9RHIwbTGPZ632vCzqjDHlxEFOK9l3C-Yx1UiQ_XDtgkjUkf0MjR59QJ5XiEqZ-geMZasBzmds9YIK-xadPfIkenTsPsWPP_YYHB2OkxXlIqT6DopYDXaOa-1i_jvwW0JkiPHhG8AwUsfpYV6gF4tFzeXYQD9ZDo76kHoV1l3r5MYa9WtG3VA-sPfYKxW5xhbiRvYm9IqhX8HwO8Ix0UL8471hLOtd16mPip4N5UR6AgRdnJ8dvCMip1vCjbw3khfFS6h9lI-jswjnHnpY16yPHWdGPGeHzMcdZTj1J_d3B_JVRjvnopCv5wD7RVdLDPqG4kscTTpQNfvPgbI3g_f-pS4--a3TGUynH_hvJb9QpDzXJg3fo3eyld1Xq3YHjmbn23lTh7sm1m3Gpwur8Df2umMq16vtlyqLF5cpdurb4zb12Gfu522Dv-HruR_IWpQGmuDdhGMILvNQQq8TdXbwyVB3NP6dT1angaKxyUxqlXuaNf40L8qKWg8-W0XV9weQdDYPXzX4YqsprvXlQpru5Dbf0kRIMSsZ-u8wvGPydeNxPTk-LFSvjlLQEY96Ex_XBXxWv_mroRp6Yoej8hmmV0wnNB7MlEK81j3dT2PXZGxnyRJKBpOyDAYkq7Pb2FsLupzips3KnoPVOY-esXFPes7csrewtYA8Eb5lli1k19qOyAAkMMLxyEsZbuW70i5MMnRR8HntxFvErXiZhguMfmL8gPOXmB3DC-E8aEafNVzVqqEGQXtdRUAcDvq6ioopSr-97tugAqvcyOar3iy3VnZLanbb1T1jZfrjxo2mp8WSHsbv7Bx1mHBBZDAAA)):

```svelte
<script>
	import { paint } from './gradient.js';
</script>

<canvas
	width={32}
	height={32}
	{@attach (canvas) => {
		const context = canvas.getContext('2d');

		$effect(() => {
			let frame = requestAnimationFrame(function loop(t) {
				frame = requestAnimationFrame(loop);
				paint(context, t);
			});

			return () => {
				cancelAnimationFrame(frame);
			};
		});
	}}
></canvas>
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

## Creating attachments programmatically

To add attachments to an object that will be spread onto a component or element, use [`createAttachmentKey`](svelte-attachments#createAttachmentKey).
