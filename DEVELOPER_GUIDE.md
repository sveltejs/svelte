# Developer Guide

The aim of this document is to give a general description of the codebase to those who would like to contribute. It will use technical language and will go deep into the various parts of the codebase.

In the most general sense, Svelte works as follows:

- A component is parsed into an [abstract syntax tree (AST)](https://en.m.wikipedia.org/wiki/Abstract_syntax_tree) compatible with the [ESTree spec](https://github.com/estree/estree)
- The AST is analyzed - defining the scopes, finding stateful variables, etc.
- The AST is transformed, either into a server component or a client component based on the `generate` option. The transformation produces a JS module and some CSS if there's any
- A server component imports the server runtime from `svelte/internal/server` and when executed with `render` produces a string of the `body` and a string of the `head`
- A client component imports the client runtime from `svelte/internal/client` and when executed - either with `mount` or `hydrate` - creates the DOM elements (or retrieves them from the pre-existing DOM in case of hydration), attaches listeners, and creates state and effects that are needed to keep the DOM in sync with the state.

## Phase 1: Parsing

Parsing is the first step to convert the component into a runnable JS file. Your Svelte component is effectively a string and while we could try to do something with regexes and replacements the standard way to do manipulation is to first build an AST and then manipulate that. An AST is a structured representation of code. Each language has its own syntax and relative AST (based on the parser used). Every JavaScript part of a Svelte component, be it the script tag or an expression tag in your template, is parsed with `acorn` (`acorn-typescript` in case you use `lang="ts"`) to produce an ESTree compatible tree.

If you want a more in-depth explanation of how a Parser works, you can refer to [this video](https://www.youtube.com/watch?v=mwvyKGw2CzU) by @tanhauhau where he builds a mini svelte 4 from scratch, but the gist of it is that you can basically have three main operations during the parsing phase: `eat`, `read` and `match` (with some variations).

You start from the first character of the string and try to match it with a known symbol in the language. Considering the shape of a svelte component, you either have an `element` (`<script>`, `<style>` or an HTML element in the template), a `tag` (`{#key}`, `{#if}`, an expression in the template etc) or raw `text`. Once you determine which of the three you are currently parsing, the parse is delegated to specialized functions that know how to handle each of those.

You can `eat` a string to determine which "construct" you are in but don't need any information out of it. For example, if you just matched a `<` in the template you can `eat('!--')` to figure out if what you are dealing with is an HTML comment. The `eat` function will return `true` or `false`, and if it's true it will also advance the current index of the parser by `'!--'.length`. Now that you know that you are inside an HTML comment you can `read` the string until you find a `-->`. The difference between `read` and `eat` is that reading will return the value to you (in this case you need it because you need to store the information about the `data` of the comment in the AST node). Finally, you can eat that `-->` to advance the next three characters, passing the required parameters to throw an error if it's not there (if you open a comment and don't close it, you'll get a syntax error).

All of the above more or less maps to this code:

```js
if (parser.eat('!--')) {
	const data = parser.read_until(regex_closing_comment);
	parser.eat('-->', true);

	parser.append({
		type: 'Comment',
		start,
		end: parser.index,
		data
	});

	return;
}
```

If the parser doesn't enter this `if`, it will check for all the other language constructs using different strategies to read the information that is needed in the AST (an HTML element for example will need the name, the list of arguments, the fragment etc).

If you want to familiarize yourself with the Svelte AST, you can go [to the playground](https://svelte.dev/playground), write your Svelte component and open the `AST Output` tab. This will not only show you the AST of the component but also provide you with hover functionality that will highlight each section of the component when you hover over a section of the AST (and vice versa).

![Svelte playground showing the AST tab and the hover functionality](assets/developer-guide/ast.png)

## Phase 2: Analysis

Once we have a AST we need to perform analysis on it. During this phase we will collect information about which variables are used, where are they used, if they are stores etc etc. This information will be later used during the third phase to properly transform and optimizing your component (for example if you declare a stateful variable but never reassign to it or never use it in a reactive context we will not bother with creating a stateful variable at all).

The very first thing to do is to create the scopes for every variable. What this operation does is to create a map from a node to a specific set of references, declarations and declarators. This is useful because if you have a situation like this

```svelte
<script module>
	let count = $state(0);
</script>

<script>
	let count = $state(0);

	function log(count) {
		console.log(count);
	}

	function increase() {
		count++;
	}
</script>

{count}
```

Depending on where you read `count` it will refer to a different variable that has been shadowed. The `count` in the template and in `increase` refers to the `count` declared in instance script, while the one in the `log` function will refer to its argument.

This is done by walking the AST and manually create a `new Scope` class every time we encounter a node that creates one.

<details>
	<summary>What does walking the AST means?</summary>
	
	As we've seen, the AST is basically a giant Javascript object with a `type` property to indicate the node type and a series of extra properties.

    For example, a `$state(1)` node will look like this (excluding position information):

    ```js
    {
    	type: "CallExpression",
    	callee: {
    		type: "Identifier",
    		name: "$state",
    	},
    	arguments: [{
    		type: "Literal",
    		value: 1,
    		raw: "1",
    	}]
    }
    ```

    Walking allows you to invoke a function (that's called a visitor) for each of the nodes in the AST, receiving the node itself as an argument.

</details>

Let's see an example: when you declare a function in your code the corresponding AST node is a `FunctionDeclaration`...so if you look into the `create_scopes` function you'll see something like this

```ts
walk(ast, state, {
	// other visitors
	FunctionDeclaration(node, { state, next }) {
		if (node.id) state.scope.declare(node.id, 'normal', 'function', node);

		const scope = state.scope.child();
		scopes.set(node, scope);

		add_params(scope, node.params);
		next({ scope });
	}
	// other visitors
});
```

What this snippet of code is doing is:

- checking if the function declaration has an identifier (basically if it's a named or anonymous function)
- if it has one it's declaring a new variable in the current scope
- creating a new scope (since in Javascript when you create a function you are creating a new lexical scope) with the current scope as the parent
- declare every argument of the function in the newly created scope
- invoking the next method that will continue the AST traversal, with the brand new scope as the current scope

The same is obviously true for Svelte-specific nodes too: the `SnippetBlock` visitor looks basically identical to the `FunctionDeclaration` one:

```ts
walk(ast, state, {
	// other visitors
	SnippetBlock(node, context) {
		const state = context.state;
		let scope = state.scope;

		scope.declare(node.expression, 'normal', 'function', node);

		const child_scope = state.scope.child();
		scopes.set(node, child_scope);

		for (const param of node.parameters) {
			for (const id of extract_identifiers(param)) {
				child_scope.declare(id, 'snippet', 'let');
			}
		}

		context.next({ scope: child_scope });
	}
	// other visitors
});
```

After the initial walk to figure out the right scopes we can now walk once again, we use a generic visitor (that runs before any visit to a node) to pass down the appropriate scope to the node (and collect information about the `// svelte-ignore` comments):

```ts
const visitors = {
	_(node, { state, next, path }) {
		const parent = path.at(-1);

		/** @type {string[]} */
		const ignores = [];

		// logic to collect svelte-ignore excluded for brevity

		const scope = state.scopes.get(node);
		next(scope !== undefined && scope !== state.scope ? { ...state, scope } : state);

		if (ignores.length > 0) {
			pop_ignore();
		}
	}
	// rest of the visitors
};
```

This means that in every visitor we can access the `scope` property and ask information about every variable by name.
