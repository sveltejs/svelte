# Documenting Props with JSDoc

Svelte supports documenting your component props using JSDoc annotations. This is especially useful when using JavaScript instead of TypeScript.

## Basic Usage

### JavaScript with JSDoc

```svelte
<script>
  /** @type {string} */
  export let name;
  
  /** @type {number} */
  export let age = 0;
  
  /** @type {boolean} */
  export let active = false;
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
  <p>Active: {active}</p>
</div>
```

### TypeScript

```svelte
<script lang="ts">
  export let name: string;
  export let age: number = 0;
  export let active: boolean = false;
</script>

<div>
  <p>Name: {name}</p>
  <p>Age: {age}</p>
  <p>Active: {active}</p>
</div>
```

## Complex Types

### Objects

```svelte
<script>
  /**
   * @type {{ name: string; age: number; email: string }}
   */
  export let user;
</script>

<div>
  <p>Name: {user.name}</p>
  <p>Age: {user.age}</p>
  <p>Email: {user.email}</p>
</div>
```

### Arrays

```svelte
<script>
  /**
   * @type {Array<string>}
   */
  export let items = [];
  
  /**
   * @type {number[]}
   */
  export let numbers = [];
</script>

<ul>
  {#each items as item}
    <li>{item}</li>
  {/each}
</ul>
```

### Union Types

```svelte
<script>
  /**
   * @type {string | number}
   */
  export let value;
  
  /**
   * @type {'small' | 'medium' | 'large'}
   */
  export let size = 'medium';
</script>

<div class="size-{size}">
  {value}
</div>
```

### Functions

```svelte
<script>
  /**
   * @type {(event: MouseEvent) => void}
   */
  export let onclick;
  
  /**
   * @type {() => Promise<void>}
   */
  export let onfetch;
</script>

<button on:click={onclick}>
  Click me
</button>
```

## Optional Props

```svelte
<script>
  /**
   * @type {string}
   */
  export let name;
  
  /**
   * @type {string | undefined}
   */
  export let title = undefined;
  
  /**
   * @type {string | null}
   */
  export let description = null;
</script>

<div>
  <h1>{name}</h1>
  {#if title}
    <h2>{title}</h2>
  {/if}
  {#if description}
    <p>{description}</p>
  {/if}
</div>
```

## Default Values

```svelte
<script>
  /**
   * @type {string}
   */
  export let name = 'World';
  
  /**
   * @type {number}
   */
  export let count = 0;
  
  /**
   * @type {boolean}
   */
  export let disabled = false;
  
  /**
   * @type {string[]}
   */
  export let items = [];
</script>

<div>
  <p>Hello, {name}!</p>
  <p>Count: {count}</p>
  <button {disabled}>Click me</button>
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>
```

## Generics

```svelte
<script>
  /**
   * @template T
   * @type {T}
   */
  export let value;
  
  /**
   * @template T
   * @type {T[]}
   */
  export let items = [];
</script>

<div>
  <p>Value: {value}</p>
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>
```

## Component Documentation

### @component Tag

You can document your component using the `@component` tag:

```svelte
<!--
  @component
  A button component that supports different variants and sizes.
  
  @example
  ```svelte
  <Button variant="primary" size="large" onclick={handleClick}>
    Click me
  </Button>
  ```
  
  @example
  ```svelte
  <Button variant="secondary" disabled>
    Disabled button
  </Button>
  ```
-->
<script>
  /**
   * The button variant.
   * @type {'primary' | 'secondary' | 'danger'}
   */
  export let variant = 'primary';
  
  /**
   * The button size.
   * @type {'small' | 'medium' | 'large'}
   */
  export let size = 'medium';
  
  /**
   * Whether the button is disabled.
   * @type {boolean}
   */
  export let disabled = false;
  
  /**
   * Click handler.
   * @type {(event: MouseEvent) => void}
   */
  export let onclick;
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  on:click={onclick}
>
  <slot />
</button>
```

## Events

```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  /**
   * @type {string}
   */
  export let value = '';
  
  function handleInput(event) {
    value = event.target.value;
    dispatch('input', { value });
  }
  
  function handleChange() {
    dispatch('change', { value });
  }
</script>

<input
  type="text"
  {value}
  on:input={handleInput}
  on:change={handleChange}
/>
```

## Slots

```svelte
<!--
  @component
  A card component with a header, content, and footer slot.
  
  @example
  ```svelte
  <Card>
    <svelte:fragment slot="header">
      <h2>Card Title</h2>
    </svelte:fragment>
    
    <p>Card content goes here.</p>
    
    <svelte:fragment slot="footer">
      <button>Action</button>
    </svelte:fragment>
  </Card>
  ```
-->
<script>
  /**
   * @type {string}
   */
  export let title = '';
</script>

<div class="card">
  <div class="card-header">
    {#if title}
      <h2>{title}</h2>
    {/if}
    <slot name="header" />
  </div>
  
  <div class="card-content">
    <slot />
  </div>
  
  <div class="card-footer">
    <slot name="footer" />
  </div>
</div>
```

## Best Practices

### 1. Always Document Complex Types

```svelte
<script>
  /**
   * @type {{
   *   id: number;
   *   name: string;
   *   email: string;
   *   role: 'admin' | 'user' | 'guest';
   * }}
   */
  export let user;
</script>
```

### 2. Use Descriptive Comments

```svelte
<script>
  /**
   * The current page number (1-based).
   * @type {number}
   */
  export let page = 1;
  
  /**
   * The number of items per page.
   * @type {number}
   */
  export let pageSize = 10;
  
  /**
   * The total number of items.
   * @type {number}
   */
  export let total = 0;
</script>
```

### 3. Document Default Values

```svelte
<script>
  /**
   * The button variant.
   * @type {'primary' | 'secondary' | 'danger'}
   * @default 'primary'
   */
  export let variant = 'primary';
</script>
```

### 4. Use @deprecated for Deprecated Props

```svelte
<script>
  /**
   * @deprecated Use `variant` instead.
   * @type {string}
   */
  export let type = '';
  
  /**
   * The button variant.
   * @type {'primary' | 'secondary' | 'danger'}
   */
  export let variant = 'primary';
</script>
```

## IDE Support

Most modern IDEs support JSDoc annotations and will provide:

- **Autocompletion** for prop names and values
- **Type checking** based on JSDoc types
- **Hover information** showing prop documentation
- **Error highlighting** for type mismatches

### VS Code

VS Code has excellent support for JSDoc in Svelte components. Install the [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) extension for the best experience.

### WebStorm

WebStorm also has great support for JSDoc in Svelte components out of the box.

## Migration from TypeScript

If you're migrating from TypeScript to JavaScript with JSDoc:

```svelte
<!-- TypeScript -->
<script lang="ts">
  export let name: string;
  export let age: number = 0;
  export let active: boolean = false;
</script>

<!-- JavaScript with JSDoc -->
<script>
  /** @type {string} */
  export let name;
  
  /** @type {number} */
  export let age = 0;
  
  /** @type {boolean} */
  export let active = false;
</script>
```

## Related Documentation

- [Svelte Props](https://svelte.dev/docs/svelte/basic-markup/props)
- [TypeScript in Svelte](https://svelte.dev/docs/svelte/typescript)
- [JSDoc Documentation](https://jsdoc.app/)
