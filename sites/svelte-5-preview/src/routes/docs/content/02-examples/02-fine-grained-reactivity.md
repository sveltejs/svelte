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

<input onkeydown={addTodo} />

{#each todos as todo}
	<div>
		<input bind:value={todo.text} />
		<input type="checkbox" bind:checked={todo.done} />
	</div>
{/each}

<p>{remaining(todos)} remaining</p>
```

...editing any individual `todo` will invalidate the entire list. You can see this for yourself by [opening the playground](/#H4sIAAAAAAAAE2VSy27jMAz8FVV7cAIE8t21DfSwf7C3OgdVohOhCmXIdLaF4H9fPewE6N7I0ZAzpBj4aCzMvHkPHOUNeMPfpomfOH1PKZnvYAliPrvFq4S0s_Jmon7AgSwQI6fdzDr2fn6NUATHBRUZh8zDTRo0eDlkzpGF9DyQcjg7C8K6y6HyoKRVi5UUidXxtVA80OKx9BbRIYHPTVjXs5cUCO0QjsICXuiai9Yf6lLrP5F4gDsgPbTNyAoiPuGbvXQdq35j7F4dWdHchhjoMVdJBxJCZOy0A2EPBkpuGjZKO8PpiRJ8UcOKHEl_ARJ3aRfYGWsJzg_N_6nRQFXt87X1c_fYGpwWYg7jINr9xS5sE6-szoTwC6S6bv8j5xxkxVabe18EtyYfBnWT9bqQt5ucb32erHQS3cDVFdTnh_saeKnLOeitMm1ir2zrohTq5CR_UDv14eddrM9Laeupj8d2c9qMBjRvyC-wntd_ggUqOqcCAAA=), adding some todos, and watching the console in the bottom right. `remaining(todos)` is recalculated every time we edit the `text` of a todo, even though it can't possibly affect the result.

Worse, everything inside the `each` block needs to be checked for updates. When a list gets large enough, this behaviour has the potential to cause performance headaches.

With runes, it's easy to make reactivity _fine-grained_, meaning that things will only update when they need to:

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

-		todos = [
-			...todos,
-			{
-				done: false,
-				text: event.target.value
-			}
-		];
+		todos.push({
+			done: false,
+			text: event.target.value
+		});

		event.target.value = '';
	}
</script>
```

In [this version of the app](/#H4sIAAAAAAAAE2VSy07EMAz8lRCQ2kqovZe2Egf-gBvlEBJ3N9qsUyXuAqr67-TRZSW4xfZ4Zmxn5ZM24Hn7tnIUZ-Atf55n_sjpe46Bv4AhCLG3i5Mx03np9EzDiCMZIEZWWc969uBJEJRv79VTKIXitKAkbZE5OAuNGg9lwlZsjeWRpEVvDdTGHsrCgRRGLkZQABaJI0Ac0OIwa9TBKYFLJKwf2F181MoiVLUBPNAxNW1_1IVSrwFYwgWQfrX1xHKmPsE3u-t7VrxgYC8qljX3IUbK2vPij-XeO1IUbdkkjIfHa47gi1qWOUm4A1B9EWaBXN-qX8L_kLC9oria75rbgrHTOC_ELAaXyn5iv-7jbKxJgPUehDzuRxA-PeIGqFP6MmTBneRDo2qTXr-m1UXHO88NFe_ej1weQZ4-7NfIc1-KQe2dcf5rZ9dkpbWJTtL2u3lY_x59u32DrpmH8KPOVulJg-ItuQW29-0HkdosMowCAAA=), editing the `text` of a todo won't cause unrelated things to be updated.
