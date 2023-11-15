---
title: Old vs new
---

This page intends to give a broad overview of how code written using runes looks compared to code not using them. You will see that for most simple tasks that only involve a single component it will actually not look much different. For more complex logic, runes simplify things.

## Counter

The `$state`, `$derived` and `$effect` runes replace magic `let` declarations, `$: x = ...` and `$: { ... }`.

- [Before](/#H4sIAAAAAAAAE0VP0Q6CMAz8lbqYAGqC-jiBxH_wTXzQUWRxbgQ6E7Ps34VN40vbu8u1V8daqXBk_OyYvj6RcXbse7Zh9O5nML5QEU54NHYQM1OMYpA9VbWuSSGBMFYTlLA9zMySQ2PsTeHERGUF-6B8VRdmki2kUa9gt81-dE1XhQOlyckY6OS9WyRZdJOf21SK_B9AFzdLZDQYzYWS4lG6NIOyiqfXax9SuoA85OBitrAlOqvptadpZCuxYZwGi_7iP__ps0sVAQAA)
- [After](/#H4sIAAAAAAAAE0VPzW7CMAx-FRMhkQ4k2I6lrbR32I3uUBJnRAtJlThIKMq7jzSgHSzr-_FnOzGlDQbWnhKz0xVZyz7nme0Y3ecCwg0N4QMHF70oTBeE1zMNox3JIIFw0RL0sA40EfJDc3wp0sWzwSJJ9PqGklfvG3xUU6k1KoWCOG-gHyAtNGkFT-8A74fmRY80GfTEN1_OwUX_XFabZxDl0nJB3f7_QNudI5Gz4GwrjBa_fap7lvDtNi9fpAVl2EOqJ-eSUieHx-tXJ7XSKFlLPmL-zn8TVUg5NQEAAA==)

```diff
<script>
-	let count = 0;
-	$: double = count * 2;

-	$: {
+	let count = $state(0);
+	let double = $derived(count * 2);
+	$effect(() => {
		if (count > 10) {
			alert('Too high!');
		}
-	}
+	});
</script>

<button on:click={() => count++}>
	{count} / {double}
</button>
```

## Tracking dependencies

In non-runes mode, dependencies of `$:` statements are tracked at _compile time_. `a` and `b` changing will only cause `sum` to be recalculated because the expression — `add(a, b)` — refers to those values.

In runes mode, dependencies are tracked at _run time_. `sum` will be recalculated whenever `a` or `b` change, whether they are passed in to the `add` function or accessed via closure. This results in more maintainable, refactorable code.

- [Before](/#H4sIAAAAAAAAE3WPwarDIBBFf2WQLlpSSNfWCP2Opgs1BuQlRnQsFPHfO0lpSxdvMcK5c4YZCxvdZBPj18K8mi3j7BICOzJ8hBXS3U5oidOSo1kTkUx0AWXve5wsgoIOTuc36Q_tOKQ8E6ph2Ksj6MMWrzVmb9At_tuCsvUwWsyRcmhAb3rtvWi_G73QGZEmF8_N5MxfV_YH6CSopqmSHtG-BPm_qldV_6pBFlVpadGVLi50eBVtkPTveRnc6OzAOMZs660-AQKQKZYyAQAA)
- [After](/#H4sIAAAAAAAAE3WQ3WrDMAyFX8WYXqSkkF5njqHPsfTCPwqYJo6x5cIwfvfKKWMMthuBvnMkHVT44lZIfPws3KsN-MhvIfALx6_QmvSEFYH6tOdoGhHJRBdQzn7GFZApNrFTQoXQXc8f31T_SVPeGrcQ3RNsp6ztzodK-pK9Qbd7dlBWGpsxAuZIjPVMH2vq7MXwE8ELnRFpavejWZ15TIWGJ8lU31dJRQxvg_zfqptV_7YGWVSlo0VXSlwoeBVDkPSIbbducWD5iDFDvdcXqDJidUMBAAA=)

```diff
<script>
-	let a = 0;
-	let b = 0;
-	$: sum = add(a, b);
+	let a = $state(0);
+	let b = $state(0);
+	let sum = $derived(add());

-	function add(a, b) {
+	function add() {
		return a + b;
	}
</script>

<button on:click={() => a++}>a++</button>
<button on:click={() => b++}>b++</button>
<p>{a} + {b} = {sum}</p>
```

## Untracking dependencies

Conversely, suppose you — for some reason — wanted to recalculate `sum` when `a` changes, but _not_ when `b` changes.

In non-runes mode, we 'hide' the dependency from the compiler by excluding it from the `$:` statement. In runes mode, we have a better and more explicit solution: [`untrack`](/docs/functions#untrack).

- [Before](/#H4sIAAAAAAAAE3WPwYrDIBCGX2WQHhJSyJ6tEfocmz2oMSBNjOi4sIjvvpO0u6WHHhz4_vmGGQub3WIT45-FebVaxtk1BHZm-BN2SN92QUucthzNnohkogsoRz_iYhEUDPBx-SP9TycOKa-Eapoa1R7Z_ubsDbrNP3IoRwOjxRwphA704dbRi_65ywudEWls89wsztyG0rQwSFBdVyUV0d8F-V7Vu6pf1SCLqrS06Eq3Fjq5ij5I-vG6TW52dmIcY7b1q_4CeJwNvCwBAAA=)
- [After](/#H4sIAAAAAAAAE3WQ3WrEIBBGX2WQwiakkF5nE6HP0fTCv4BsoqLjQhHfvWPTpRTaG2GOx49vLGyzu0lseivMicOwib2GwJ4ZfoQ2pLvZ0dCcfI6qkTmpaAPy1a1oj-AjQoHsMAp1gwpb9AdczmeXK0mk7QZBwAJPCQWa7qW_Pqj8k6Z8NK5NtHejO6F11_ffWVt2Cq138EWhNLZiNJgjMRgeVTq6XDjIM7Wubh5_irtZZkQK8W5Su1W3pZy6GIbK6ZjHU-D_q7Kp8rcaeBGVOhRZaYFCe9R5DJy-7_DabtZoNmHMpr7XT7Bzqxt5AQAA)

```diff
<script>
+	import { untrack } from 'svelte';

-	let a = 0;
-	let b = 0;
-	$: sum = add(a);
+	let a = $state(0);
+	let b = $state(0);
+	let sum = $derived(add());

-	function add(a) {
-		return a + b;
+	function add() {
+		return a + untrack(() => b);
	}
</script>

<button on:click={() => a++}>a++</button>
<button on:click={() => b++}>b++</button>
<p>{a} + {b} = {sum}</p>
```

## Simple component props

```diff
<script>
-	export let count = 0;
+	let { count = 0 } = $props();
</script>

{count}
```

## Advanced component props

```diff
<script>
-	let classname = '';
-	export { classname as class };
+	let { class: classname, ...others } = $props();
</script>

<pre class={classname}>
-	{JSON.stringify($$restProps)}
+	{JSON.stringify(others)}
</pre>
```

## Autoscroll

To implement a chat window that autoscrolls to the bottom when new messages appear (but only if you were _already_ scrolled to the bottom), we need to measure the DOM before we update it.

In Svelte 4, we do this with `beforeUpdate`, but this is a flawed approach — it fires before _every_ update, whether it's relevant or not. In the example below, we need to introduce checks like `updatingMessages` to make sure we don't mess with the scroll position when someone toggles dark mode.

With runes, we can use `$effect.pre`, which behaves the same as `$effect` but runs before the DOM is updated. As long as we explicitly reference `messages` inside the effect body, it will run whenever `messages` changes, but _not_ when `theme` changes.

`beforeUpdate`, and its equally troublesome counterpart `afterUpdate`, will be deprecated in Svelte 5.

- [Before](/#H4sIAAAAAAAAE31WXa_bNgz9K6yL1QmWOLlrC-w6H8MeBgwY9tY9NfdBtmlbiywZkpyPBfnvo2zLcZK28AWuRPGI5OGhkEuQc4EmiL9eAskqDOLg97oOZoE9125jDigs0t6oRqfOsjap5rXd7uTO8qpW2sIFEsyVxn_qjFmcAcstar-xPN3DFXKtKgi768IVgQku0ELj3Lgs_kZjWIEGNpAzYXDlHWyJFZI1zJjeh4O5uvl_DY8oUkVeVoFuJKYls-_CGYS25Aboj0EtWNqel0wWoBoLTGZgmdgDS9zW4Uz4NsrswPHoyutN4xInkylstnBxdmIhh8m7xzqmoNE2Wq46n1RJQzEbq4g-JQSl7e-HDx-GdaTy3KD9E3lRWvj5Zu9QX1QN20dj7zyHz8s-1S6lW7Cpz3RnXTcm04hIlfdFuO8p2mQ5-3a06cqjrn559bF_2NHOnRZ5I1PLlXQNyQT-hedMHeUEDyjtdMxsa4n2eIbNhlTwhyRthaOKOmYtniwF6pwt0wXa6MBEg0OibZec27gz_dk3UrZ6hB2LLYoiv521Yd8Gt-foTrfhiCDP0lC9VUUhcDLU49Xe_9943cNvEArHfAjxeBTovvXiNpFynfEDpIIZs9kFbg52QbeNHWZzebz32s7xHco3nJAJl1nshmhz8dYOQJDyZetnbb2gTWe-vEeWlrfpZMavr56ldb29eNt6UXvgwgFbp_WC0tl2RK25rGk6lYz3nUI2lzvBXGHhPZPGWmKUXFNBKqdaW259wl_aHbiqoVIZdpE60Nax6IOujT0LbFFxIVTCxCRR2XloUcYNvSbnGHKBp763jHoj59xiZWJI0Wm0P_m3MSS985xkasn-cFq20xTDy3J5KFcjgUTD69BHdcHIjz431z28IqlxGcPSfdFnrGDZn6gD6lyo45zyHAD-btczf-98nhQxHEvKfeUtOVkSejD3q-9X7JbzjGtsdUxlKdFU8qGsT78uaw848syWMXz85Waq2Gnem4mAn3prweq4q6Y3JEpnqMmnPoFRgmd3ySW0LLRqSKlwYHriCvJvUs2yjMaaoA-XzTXLeGMe45zmhv_XAno3Mj0xF7USuqNvnE9H343QHlq-eAgxpbTPNR9yzUkgLjwSR0NK4wKoxy-jDg-9vy8sUSToakzW-9fX13Em9Q8T6Z26uZhBN36XUYo5q7ggLXBZoub2Ofv7g6GCZfTxe034NCjiudXj7Omla0eTfo7QBPOcYxbE7qG-vl3_B1G-_i_JCAAA)
- [After](/#H4sIAAAAAAAAE31WXa-jNhD9K7PsdknUQJLurtRLPqo-VKrU1327uQ8GBnBjbGSb5KZR_nvHgMlXtyIS9njO-MyZGZRzUHCBJkhez4FkNQZJ8HvTBLPAnhq3MQcUFmlvVKszZ1mbTPPGbndyZ3ndKG3hDJZne7hAoVUNYY8JV-RBPgIt2AprhA18MpZZnIQ50_twuvLHNRrDSjRXj9fwiCJTBLIKdCsxq5j9EM4gtBU3QD8GjWBZd14xWYJqLTCZg2ViDyx1W4cz4dv0hsiB49FRHkyfsCgws3GjcTKZwmYLZ2feWc9o1W8zJQ2Fb62i5JUQRNRHgs-fx3WsisKg_RN5WVn4-WrvUd9VA9tH4-AcwbfFQIpkLWByvWzqSe2sk3kyjUlOec_XPU-3TRaz_75tuvKoi19e3OvipSpamVmupJM2F_gXnnJ1lBM8oLQjHceys8R7PMFms4HwD2lRhzeEe-EsvluSrHe2TJdo4wMTLY48XKwPzm0KGm2r5ajFtRYU4TWOY7-ddWHfxhDP0QkQhnf5PWRnVVkKnIx8fZsOb5dR16nwG4TCCRdCMphWQ7z1_DoOcp3zA2SCGbPZBa5jd0G_TRxmc36Me-mG6A7l60XIlMs8ce2-OXtrDyBItdz6qVjPadObzx-RZdV1nJjx64tXad1sz962njceOHfAzmk9JzrbXqg1lw3NkZLJvu-AzfmuIS4w955pay0pSq6ZoCalXDttPeHv3Q5c1lCrHPubetDWqegvXRt7EtihklKolIlJqvLTWKKcG5r7UwKFwPehtoxqIyNusTYJZOh6cDj5uzXUWqeI2tCS_eG06oYhgeVicahWNw0Sj8M93OouIz963FgO8JpajcsEFu6Jv2ENi-FEHVAXQh0j4jkCfGxXMx83itIygWNF3FfeUpAlpU_bfvXjjN0yyrnGro8pLSXaWj6k9fXXReMBR57bKoEvv1xNNXuPBjMJ8NNgLVmT9NkMhlTpHDX5NO9glOD5HbmUlqVWLXUqHJieuIT8J6Vhec4lZbN8CBZplvPWPN7zHhn-TwcY3Mj0pFzctdCdfLd8evmugg7QaukhpJTSnmsxci2oQdz1SBqNlG4ToBovbyo81v4-sVRRQ9e3Yn18eXm5ZdL8L5HBqZ-LGfTjd76hWLCaC-oFLivU3D6zvz8YM1jEX35UhK9jRzyX-pY9fem60aT_AjTBvOCYB4nVLV7eLv8CKAV_uEYIAAA=)

```diff
<script>
-	import { beforeUpdate, afterUpdate, tick } from 'svelte';
+	import { tick } from 'svelte';

-	let updatingMessages = false;
-	let theme = 'dark';
-	let messages = [];
+	let theme = $state('dark');
+	let messages = $state([]);

	let div;

-	beforeUpdate(() => {
+	$effect.pre(() => {
-		if (!updatingMessages) return;
+		messages;
		const autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 50;

		if (autoscroll) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}

-		updatingMessages = false;
	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			const text = event.target.value;
			if (!text) return;

-			updatingMessages = true;
			messages = [...messages, text];
			event.target.value = '';
		}
	}

	function toggle() {
		toggleValue = !toggleValue;
	}
</script>

<div class:dark={theme === 'dark'}>
	<div bind:this={viewport}>
		{#each messages as message}
			<p>{message}</p>
		{/each}
	</div>

	<input on:keydown={handleKeydown} />

	<button on:click={toggle}>
		Toggle dark mode
	</button>
</div>
```
