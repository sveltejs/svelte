/**
 * @deprecated Use `Component` instead. See TODO for more information.
 */
export interface ComponentConstructorOptions<
	Props extends Record<string, any> = Record<string, any>
> {
	target: Element | Document | ShadowRoot;
	anchor?: Element;
	props?: Props;
	context?: Map<any, any>;
	hydrate?: boolean;
	intro?: boolean;
	$$inline?: boolean;
}

/**
 * @deprecated use `Component` instead. See TODO for more information.
 *
 * Base class for Svelte components in Svelte 4. Svelte 5+ components implement
 * the `Component` interface instead. This class is only provided for backwards
 * compatibility with Svelte 4 typings and doesn't have any runtime equivalent.
 *
 * Can be used to create strongly typed Svelte components.
 *
 * #### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponent } from "svelte";
 * export class MyComponent extends SvelteComponent<{foo: string}> {}
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 */
export class SvelteComponent<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> {
	[prop: string]: any;

	constructor(options: ComponentConstructorOptions<Props>);
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * */
	$$prop_def: Props;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * */
	$$events_def: Events;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * */
	$$slot_def: Slots;

	$destroy(): void;

	$on<K extends Extract<keyof Events, string>>(
		type: K,
		callback: (e: Events[K]) => void
	): () => void;

	$set(props: Partial<Props>): void;
}

/**
 * @deprecated Use `Component` instead. See TODO for more information.
 */
export class SvelteComponentTyped<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> extends SvelteComponent<Props, Events, Slots> {}

export * from './legacy-client.js';
