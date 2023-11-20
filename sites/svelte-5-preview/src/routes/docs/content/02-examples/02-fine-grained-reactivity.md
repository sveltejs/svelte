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

		todos = [
			...todos,
			{
				done: false,
				text: event.target.value
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

...editing any individual `todo` will invalidate the entire list. You can see this for yourself by [opening the playground](/#H4sIAAAAAAAAE2VSy27jMAz8FVV7cAIE8t21DfSwf7C3OgdVohOhCmXIdLaF4H9fPewE6N7I0ZAzpBj4aCzMvHkPHOUNeMPfpomfOH1PKZnvYAliPrvFq4S0s_Jmon7AgSwQI6fdzDr2fn6NUATHBRUZh8zDTRo0eDlkzpGF9DyQcjg7C8K6y6HyoKRVi5UUidXxtVA80OKx9BbRIYHPTVjXs5cUCO0QjsICXuiai9Yf6lLrP5F4gDsgPbTNyAoiPuGbvXQdq35j7F4dWdHchhjoMVdJBxJCZOy0A2EPBkpuGjZKO8PpiRJ8UcOKHEl_ARJ3aRfYGWsJzg_N_6nRQFXt87X1c_fYGpwWYg6bOIl2f7EL28grqzMj_AKprtsHyTkHWbLV5t4Xxa3Lh0HdZMEu5PUm61ufJyvdRDdwdQX1-eG-Bl7qcg56q0yr2CvbuiiFOjnJP9ROffh5GOvzVNp66uO13Zw2owHNG_ILrOf1H3DaaQeoAgAA), adding some todos, and watching the console in the bottom right. `remaining(todos)` is recalculated every time we edit the `text` of a todo, even though it can't possibly affect the result.

Worse, everything inside the `each` block needs to be checked for updates. When a list gets large enough, this behaviour has the potential to cause performance headaches.

With runes, it's easy to make reactivity _fine-grained_, meaning that things will only update when they need to. Mark `todos` as `$state`, create a `Todo` class with `done` and `text` state fields, then instantiate the class inside `addTodo`:

```diff
<script>
-	let todos = [];
+	let todos = $state([]);

+	class Todo {
+		done = $state(false);
+		text = $state();
+
+		constructor(text) {
+			this.text = text;
+		}
+	}

	function remaining(todos) {
		console.log('recalculating');
		return todos.filter(todo => !todo.done).length;
	}

	function addTodo(event) {
		if (event.key !== 'Enter') return;

-		todos = [
-			...todos,
-			{
-				done: false,
-				text: event.target.value
-			}
-		];
+		todos = [...todos, new Todo(event.target.value)];

		event.target.value = '';
	}
</script>
```

In [this version of the app](/#H4sIAAAAAAAAE21SwW6DMAz9lSybBEhTuDNA2mF_sFvpIUtMGzVNUGK6TYh_XxKgSNtOsWO_Z_vZE-2VBk-rw0QNvwKt6Osw0GeK30N0_A00QvC9HZ2IP7UXTg3YdqZDDUjQSutJQ548coT8cCxeQigEhebek_cQJlP0O5TWwJ7Zc-0hJYcQwhfuoY0ikFjj0Y0CrctjTrFxBchZebbi4rMyzfGZF3w_GoHKGuLgypVR5pSndu8skd5qYNqe8syB4FqMmmNIzLbOHODozDImC2IhuERCmpY8RIPFsQqmwZzw_PJfdS5llCGHG5h9AtWT5Ydd4Js8NA3J3kxgzwqy1LyLsEl8YIwl-5kY-CQ7J0PuToDsxvUIxfEO_BsMLFm2NVmX-y5NrcwwIrGmCu1I-2maae17JmXKmB6Bi_O6cO6TkdSupbq1S8WV5UMZWaWCzZQ0igtaefaseGNNR8UZxOXDfnV0wSUf5IqM6m7IulwqTWXsJMlcD-30e7vzvu-6HNpwvVcrVa9A0iocE8zH-QeS_FSn-AIAAA==), editing the `text` of a todo won't cause unrelated things to be updated.

## Gotchas

If we only do the first step (adding `$state`) and skip the second (creating a class with state fields), [the app breaks](/#H4sIAAAAAAAAE2VSyU7DMBD9FWOQ0kqVcw9JJA78AbemB2NPWgvXjuxJAVn5d7wkVILbLG_mvVkCHZUGT5tjoIZfgTb0ZZrogeL3lBx_A40QfW9nJ1Kk9cKpCfvBDKgBCVppPenIk0eOsDue9s8xFZPjbAQqa4iDK1dGmfMuY_ckpPSAwhpvNTBtz7vKgeBazJpjBFa5R4Q4wNmZwsGiUgSXm5CuJw_JYNIa2DMN5oyXXLT8YedSvkXgDm5g8JdbjaRE2Ad8k4euI9Wrid2rPSmc6xADbvMdizsgYyzHDlsgbMaASU1DRq49HO5RhC9sSKFD7s6A7Mb1DBtiKcbpl_M_NAqoqm2-tr7fwLTKTDMSa5o4ibSfpgvryAupMyI8AheX9VDcZyNTtlLd-sK4dnlXRjaZsAt5vUn62ueOSr_RDVRcQHy826-Blrrsg1wr0yq2yrYuTKFOSvKF2qkPfx9jub9KW099_LqrlWpUIGmDbobltPwAmGXpQrACAAA=) — toggling the checkboxes won't cause `remaining(todos)` to be recalculated.

That's because in runes mode, Svelte no longer invalidates everything when you change something inside an `each` block. Previously, Svelte tried to statically determine the dependencies of the mutated value in order to invalidate them, causing confusing bugs related to overfiring (invalidating things that weren't actually affected) and underfiring (missing affected variables). It made apps slower by default and harder to reason about, especially in more complex scenarios.

In runes mode, the rules around triggering updates are simpler: Only state declared with `$state` or `$derived` or `$props` causes a rerender. In the [broken example](/#H4sIAAAAAAAAE2VSyU7DMBD9FWOQ0kqVcw9JJA78AbemB2NPWgvXjuxJAVn5d7wkVILbLG_mvVkCHZUGT5tjoIZfgTb0ZZrogeL3lBx_A40QfW9nJ1Kk9cKpCfvBDKgBCVppPenIk0eOsDue9s8xFZPjbAQqa4iDK1dGmfMuY_ckpPSAwhpvNTBtz7vKgeBazJpjBFa5R4Q4wNmZwsGiUgSXm5CuJw_JYNIa2DMN5oyXXLT8YedSvkXgDm5g8JdbjaRE2Ad8k4euI9Wrid2rPSmc6xADbvMdizsgYyzHDlsgbMaASU1DRq49HO5RhC9sSKFD7s6A7Mb1DBtiKcbpl_M_NAqoqm2-tr7fwLTKTDMSa5o4ibSfpgvryAupMyI8AheX9VDcZyNTtlLd-sK4dnlXRjaZsAt5vUn62ueOSr_RDVRcQHy826-Blrrsg1wr0yq2yrYuTKFOSvKF2qkPfx9jub9KW099_LqrlWpUIGmDbobltPwAmGXpQrACAAA=), `todo` is declared by the `#each` block, and neither the `text` nor the `done` property are referencing state. One solution would be to turn `text` and `done` into `$state` fields, as shown above. [The other solution](/#H4sIAAAAAAAACmVS226jMBD9lam7EokUmXcKSH3YP9i3EK1ce0isOjayh7QV4t9rG2iq9m0uZ86Z28R6bTCw6jgxK67IKvY8DOzA6GNITrihIYx-cKOXKVIH6fVAbWc7MkhATrkADfwJJAh3x9P-KaZish-tJO0seLwKbbU97zJ2D1NKdySdDc4gN-68KzxKYeRoBEVgkTkixCON3i4aPHZK6DMJNC08JIMrZ3HPDdozXXLR_ENdKPUvAnd4Q0tf2rqHJcJf8QMemgaKvzayF3tYNNchOtrmO3LOs33YODpK4hX0wgQ8bDHCd6pg4Sbhz0j8JsyIS34-fRH_hkSVotiGqMv7om2t7TASOFvFdpV7s820zjVDmRHTIwp5Wa8hAvw_gE6roFrpW7soriwv2qoqCzZTxh_1iae2V647Mj1B0zF5Qfn64t47ttRmH9W36rSIrbouF8WpTB3lc9RDO_38gvn-F3U5tPHFrk7pXqNiFfkR59P8CWtDxuCdAgAA) would be to bind to `todos[i].text` instead of `todo.text` — this way, Svelte picks up the reference to the `todos` `$state` and invalidates it as a whole. Keep in mind that you lose the fine-grained reactivity this way — the whole array is invalidated on every keystroke.
