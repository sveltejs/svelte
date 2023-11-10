---
title: Fine-grained reactivity
---

In Svelte 4, reactivity centres on the _component_ and the top-level state declared therein. What this means is that in a situation like this...

```svelte
<script>
	let todos = [];

	function remaining(todos) {
		console.log('recalculating');
		return todos.filter((todo) => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

		let done = false;
		let text = event.target.value;

		todos = [
			...todos,
			{
				done,
				text
			}
		];

		event.target.value = '';
	}
</script>

<input on:keydown={addTodo} />

{#each todos as todo}
	<div>
		<input bind:value={todo.text} />
		<input type="checkbox" bind:checked={todo.done} />
	</div>
{/each}

<p>{remaining(todos)} remaining</p>
```

...editing any individual `todo` will invalidate the entire list. You can see this for yourself by [opening the playground](/#H4sIAAAAAAAAE2VSu27DMAz8FVUdnACBvDu2gQ79g25xBlWiE6EKZch0msLwv1cPJwHajaSOdzyKM--NhZFXh5mjvACv-Nsw8B2nnyEm4xUsQchHN3kVK_WovBmo7bAjC8TIaTeyhh2O-1AKxX5CRcYh83CRBg2eNgmzZXN87kg5HJ0FYd1pU3hQ0qrJSgrAYrvPEA80eczcIkxI4BMJa1r2EgOhHcJWWMATnVPT8kddav0RgBu4AtJD2_QsV8QX_LCXpmHFOwb2Ysuy5moie4siwVov7Qj7Z5ngRqGceUj6E5C4SjvBo_mxFCFEinf3ATqKpLt7EqlyvBwf3f-JA1VR3G3W5fMLsDY4TMQcVsGQdt_YzKvzhZUJMb-CVOf1n-SYgrgsqrW5tllxZfk0qKsk2Mxpy3G8leeJiqfRdFydQX19ulvHc1_KQa-d0eW9sy6z0lzGSdJH1UM7_72P5XkxdTm04eguTpvegOYV-QmW4_IL1Ksxyq8CAAA=), adding some todos, and watching the console in the bottom right. `remaining(todos)` is recalculated every time we edit the `text` of a todo, even though it can't possibly affect the result.

Worse, everything inside the `each` block needs to be checked for updates. When a list gets large enough, this behaviour has the potential to cause performance headaches.

With runes, it's easy to make reactivity _fine-grained_, meaning that things will only update when they need to. Begin by using the `$state` rune:

```diff
<script>
-	let todos = [];
+	let todos = $state([]);

	function remaining(todos) {
		console.log('recalculating');
		return todos.filter(todo => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

-		let done = false;
-		let text = event.target.value;
+		let done = $state(false);
+		let text = $state(event.target.value);

		todos = [...todos, {
			done,
			text
		}];

		event.target.value = '';
	}
</script>
```

Next, update `done` and `text` to use `get` and `set` properties:

```diff
<script>
	let todos = $state([]);

	function remaining(todos) {
		console.log('recalculating');
		return todos.filter(todo => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

		let done = $state(false);
		let text = $state(event.target.value);

		todos = [...todos, {
-			done,
-			text
+			get done() { return done },
+			set done(value) { done = value },
+			get text() { return text },
+			set text(value) { text = value }
		}];

		event.target.value = '';
	}
</script>
```

In [this version of the app](/#H4sIAAAAAAAAE2VTTY-kIBD9Kwy7iZp08O6oyR72H-yt7QMDpU2GBiNl70yM_30QsJ2PG0W9eu9VUSy0Vxocrc4LNfwGtKJ_xpGeKL6PW-DuoBF87Ow8ie2mdmJSI7ad6VADErTSOtKQ3w45Qn6-FM8-5ZP9bAQqa8gEN66MMkMesAVZtnSHwhpnNTBthzybQHAtZs3RA7PA4SET4DyZqMG8U4QpkJCmJU_bgUlroGAazIDXULR-U-dS_vPAHO5g8KGtehJv2Cu8k6emIdlf49mzgkTN1ETscRM5Wuy5drA7DCOANzzSkRb5NACyO9czFA-yfVhnxlg4n3ZDHQ5JKPcmk4kovJ52iNshkdbjkrMQfwIOydVnruDyK1eAPLhSG4kr4tbLw_vPvjw4y_ah1-WxGKZWZpyRWFP58Ur73zRLeoeVlAGx_AIurml7uAuHoFlLdW-jYmJ5UUZWQbBZwptvRhPPgdoWtumouIJ4fbFvHY11IQaZKrdx7ZV1GZWWcnMS1qYe2-X7tq7H_tbl2PqvcLNS9QokrXCaYb2sH9bw9GZFAwAA), editing the `text` of a todo won't cause unrelated things to be updated.

## Gotchas

If we only do the first step (adding `$state`) and skip the second (exposing the state via `get` and `set` properties), [the app breaks](/#H4sIAAAAAAAAE2VSy27jMAz8FVVdwDEQyHfXNtDD_sHe4hxUiU6EKJIh0WkLw_--etgx0N5IcTjDoTjTQWnwtD7N1PA70Jq-jyM9UvweY-IfoBFC7u3kRHxpvHBqxK43PWpAglZaT1ryxyNHOJzO5VsoheIwGYHKGuLgzpVR5nJI2JLMsdyjsMZbDUzby6FwILgWk-YYgEXiCBAHODmTNViYFMElEtJ25CUGTFoDJdNgLnhNTcsPdS7lvwA8wAMMPrXVQPILu8E3eWlbUvw1gb0oSdZcTWSPUWS3OHDtYZswrQC-cC9nWuTuAsgeXE9QPsm2ZZ0YYyk-bgP1GEWOWxIpc7ycn92_mQNVUWy2m2r_GtMoM05IrKmDQWk_TTuvm1hIlRDzK3BxXf-P-xTE5WEj1aPLiivLhzKyToLtnLYex1t5dlQ8mban4gri9mG_epr7Ug5y7Ywut86mykpzFSdJH9eM3fzzXpb9gppq7MIx3q1UgwJJa3QTLOflP0Toax7HAgAA) — toggling the checkboxes won't cause `remaining(todos)` to be recalculated.

That's because in runes mode, Svelte no longer invalidates everything when you change something inside an `each` block. Previously, Svelte tried to statically determine the dependencies of the mutated value in order to invalidate them, causing confusing bugs related to overfiring (invalidating things that weren't actually affected) and underfiring (missing affected variables). It made apps slower by default and harder to reason about, especially in more complex scenarios.

In runes mode, the rules around triggering updates are simpler: Only state declared by a `$state` or `$props` rune causes a rerender. In the [broken example](/#H4sIAAAAAAAAE2VSy27jMAz8FVVdwDEQyHfXNtDD_sHe4hxUiU6EKJIh0WkLw_--etgx0N5IcTjDoTjTQWnwtD7N1PA70Jq-jyM9UvweY-IfoBFC7u3kRHxpvHBqxK43PWpAglZaT1ryxyNHOJzO5VsoheIwGYHKGuLgzpVR5nJI2JLMsdyjsMZbDUzby6FwILgWk-YYgEXiCBAHODmTNViYFMElEtJ25CUGTFoDJdNgLnhNTcsPdS7lvwA8wAMMPrXVQPILu8E3eWlbUvw1gb0oSdZcTWSPUWS3OHDtYZswrQC-cC9nWuTuAsgeXE9QPsm2ZZ0YYyk-bgP1GEWOWxIpc7ycn92_mQNVUWy2m2r_GtMoM05IrKmDQWk_TTuvm1hIlRDzK3BxXf-P-xTE5WEj1aPLiivLhzKyToLtnLYex1t5dlQ8mban4gri9mG_epr7Ug5y7Ywut86mykpzFSdJH9eM3fzzXpb9gppq7MIx3q1UgwJJa3QTLOflP0Toax7HAgAA), `todo` is declared by the `#each` block, and neither the `text` nor the `done` property are referencing values of `$state` runes. One solution would be to turn `text` and `done` into `$state` references, as shown above. [The other solution](/#H4sIAAAAAAAACmVS226jMBD9lam7EokUmXcKSH3YP9i3EK1ce0isOjayh7QV4t9rG2iq9m0uZ86Z28R6bTCw6jgxK67IKvY8DOzA6GNITrihIYx-cKOXKVIH6fVAbWc7MkhATrkADfwJJAh3x9P-KaZish-tJO0seLwKbbU97zJ2D1NKdySdDc4gN-68KzxKYeRoBEVgkTkixCON3i4aPHZK6DMJNC08JIMrZ3HPDdozXXLR_ENdKPUvAnd4Q0tf2rqHJcJf8QMemgaKvzayF3tYNNchOtrmO3LOs33YODpK4hX0wgQ8bDHCd6pg4Sbhz0j8JsyIS34-fRH_hkSVotiGqMv7om2t7TASOFvFdpV7s820zjVDmRHTIwp5Wa8hAvw_gE6roFrpW7soriwv2qoqCzZTxh_1iae2V647Mj1B0zF5Qfn64t47ttRmH9W36rSIrbouF8WpTB3lc9RDO_38gvn-F3U5tPHFrk7pXqNiFfkR59P8CWtDxuCdAgAA) would be to bind to `todos[i].text` instead of `todo.text` — this way, Svelte picks up the reference to the `todos` `$state` and invalidates it as a whole. Keep in mind that you lose the fine-grained reactivity this way — the whole array is invalidated on every keystroke.
