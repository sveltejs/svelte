---
title: The @debug tag
---

Occasionally, it's useful to inspect a piece of data as it flows through your app.

One approach is to use `console.log(...)` inside your markup. If you want to pause execution, though, you can use the `{@debug ...}` tag with a comma-separated list of values you want to inspect:

```svelte
{@debug user}

<h1>Hello {user.firstname}!</h1>
```

If you now open your devtools and start interacting with the `<input>` elements, you'll trigger the debugger as the value of `user` changes.
