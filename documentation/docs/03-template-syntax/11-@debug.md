---
title: {@debug ...}
---

The `{@debug ...}` tag offers an alternative to `console.log(...)`. It logs the values of specific variables whenever they change, and pauses code execution if you have devtools open.

```svelte
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

`{@debug ...}` accepts a comma-separated list of variable names (not arbitrary expressions).

```svelte
<!-- Compiles -->
{@debug user}
{@debug user1, user2, user3}

<!-- WON'T compile -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

The `{@debug}` tag without any arguments will insert a `debugger` statement that gets triggered when _any_ state changes, as opposed to the specified variables.


## {@debug ...} vs $inspect

`{@debug}` and [`$inspect`]($inspect) both exist because one is a template debugger and the other is a `<script>` rune. `{@debug}` is not deprecated.

Reach for `{@debug}` when the value you care about is used in markup and you want DevTools to pause (`debugger`) when it changes. It only accepts identifiers, not expressions.

Reach for `$inspect` when you are already in `<script>`, need to log an expression, or want deep reactive tracking that is stripped from production builds. If you only need a breakpoint from script, `$inspect(value).with(() => { debugger; })` is the rune equivalent of `{@debug}`.
