import type {
	AssignmentExpression,
	ClassDeclaration,
	Expression,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration
} from 'estree';
import type { Location } from 'locate-character';
import type { SourceMap } from 'magic-string';
import type { Context } from 'zimmerframe';
import type { Scope } from '../phases/scope.js';
import * as Css from './css.js';
import type { Namespace, SvelteNode } from './template.js';

/** La forme de ce que renvoie `compile` du `svelte/compiler` */
export interface CompileResult {
	/** Le code JavaScript généré après compilation du composant */
	js: {
		/** Le code généré */
		code: string;
		/** Une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> */
		map: SourceMap;
	};
	/** Le code CSS compilé */
	css: null | {
		/** Le code généré */
		code: string;
		/** Une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> */
		map: SourceMap;
	};
	/**
	 * * Un tableau de <span class="vo">[warnings](/docs/development#warning)</span> générés pendant la compilation. Chaque <span class="vo">[warning](/docs/development#warning)</span> possède les attributs suivants :
	 * - `code` : une `string` identifiant la catégorie du <span class="vo">[warning](/docs/development#warning)</span>
	 * - `message` : décrit le problème de manière intelligible
	 * - `start` et `end` : si le <span class="vo">[warning](/docs/development#warning)</span> est relevé à un endroit particulier, ce sont des objets avec les propriétés `line`, `column` et `character`
	 */
	warnings: Warning[];
	/**
	 * Méta-données du composant compilé
	 */
	metadata: {
		/**
		 * Si oui ou non le fichier a été compilé avec le mode Runes, soit dû à une option explicite, soit inféré de l'usage.
		 * Pour `compileModule`, ceci vaut toujours `true`
		 */
		runes: boolean;
	};
}

export interface Warning {
	start?: Location;
	end?: Location;
	// TODO there was pos: number in Svelte 4 - do we want to add it back?
	code: string;
	message: string;
	filename?: string;
}

export interface CompileError extends Error {
	code: string;
	filename?: string;
	position?: [number, number];
	start?: Location;
	end?: Location;
}

export type CssHashGetter = (args: {
	name: string;
	filename: string | undefined;
	css: string;
	hash: (input: string) => string;
}) => string;

export interface OptimizeOptions {
	hydrate?: boolean;
}

export interface CompileOptions extends ModuleCompileOptions {
	/**
	 * Définit le nom de la classe JavaScript généré (bien que le compilateur la renomera si son nom entre en conflit avec une autre variable).
	 * Il est normalement inféré à partir l'option `filename`.
	 */
	name?: string;
	/**
	 * Si `true`, indique au compilateur de générer un constructeur de <span class="vo">[custom element](/docs/web#web-component)</span> à la place d'un composant Svelte traditionnel.
	 *
	 * @default false
	 */
	customElement?: boolean;
	/**
	 * Si `true`, des <span class="vo">[getters et setters](/docs/development#getter-setter)</span> seront générés pour les <span class="vo">[props](/docs/sveltejs#props)</span> des composants. Si `false`, ils ne seront créés que pour les valeurs exportées en lecture seules (c'est-à-dire celles déclarées avec `const`, `class` et `function`). Activer l'option de compilation `customElement: true` changera la valeur par défaut de `accessors` à `true`.
	 *
	 * @default false
	 */
	accessors?: boolean;
	/**
	 * Le <span class="vo">[namespace](/docs/development#namespace)</span> de l'élément; par exemple, `"mathml"`, `"svg"`, `"foreign"`.
	 *
	 * @default 'html'
	 */
	namespace?: Namespace;
	/**
	 * Si `true`, indique au compilateur que vous vous engagez à ne pas muter d'objets.
	 * Cela permet au compilateur d'être moins conservatif lorsqu'il vérifie si une valeur a changé.
	 *
	 * @default false
	 */
	immutable?: boolean;
	/**
	 * - `'injected'`: le style sera inclus dans les classes JavaScript et injecté au <span class="vo">[runtime](/docs/development#runtime)</span> pour les composants réellement rendus.
	 * - `'external'`: le style sera renvoyé dans la propriété `css` du résultat de la compilation. La plupart des <span class="vo">[plugins](/docs/development#plugin)</span> Svelte de <span class="vo">[bundler](/docs/web#bundler-packager)</span> définiront cette option à `'external'` et utiliseront le CSS généré statiquement. Cela permet d'atteindre de meilleures performances, puisque les <span class="vo">[bundles](/docs/web#bundler-packager)</span> JavaScript seront plus petits et le style généré sous forme de fichiers `.css` pourra être mis en cache.
	 * Cette propriété vaut toujours `'injected'` lorsque l'on compile avec le mode `customElement`.
	 */
	css?: 'injected' | 'external';
	/**
	 * Une fonction qui prend comme arguments `{ hash, css, name, filename }` et retourne un nom de classe utilisé pour le css <span class="vo">[scopé](/docs/development#scope)</span>.
	 * La fonction par défaut retourne `svelte-${hash(css)}`.
	 *
	 * @default undefined
	 */
	cssHash?: CssHashGetter;
	/**
	 * Si `true`, les commentaires HTML seront conservés au cours du rendu côté serveur.
	 * Par défault, ils sont supprimés.
	 *
	 * @default false
	 */
	preserveComments?: boolean;
	/**
	 * Si `true`, les caractères blancs (espaces, tabulations, ...) seront gardés tels quels, plutôt que supprimés ou fusionnés lorsque c'est possible.
	 *
	 * @default false
	 */
	preserveWhitespace?: boolean;
	/**
	 * Définir à `true` pour forcer le compilateur à utiliser le mode Runes, même s'il n'y a aucune indication de l'usage de Runes.
	 * Définir à `false` pour forcer le compilateur à ignorer les Runes, même s'il y a des indications de l'usage de Runes.
	 * Définir à `undefined` (valeur par défaut) pour inférer le mode Runes depuis le code du composant.
	 * Vaut toujours `true` pour les modules JS/TS compilés avec Svelte.
	 * Vaudra `true` par défaut avec Svelte 6.
	 * @default undefined
	 */
	runes?: boolean | undefined;
	/**
	 * Si `true`, expose la version majeure de Svelte dans l'objet global `window` du navigateur.
	 *
	 * @default true
	 */
	discloseVersion?: boolean;
	/**
	 * @deprecated N'utilisez ceci que comme une solution temporaire avant de migrer votre code.
	 */
	legacy?: {
		/**
		 * Applique une transformation de sorte que l'export par défaut des fichiers Svelte puisse toujours être instancié de la même façon qu'avec Svelte 4 –
		 * comme une classe lorsque l'on compile pour le navigateur (mais en utilisant `createClassComponent(MyComponent, {...})` depuis `svelte/legacy`)
		 * ou comme un objet avec une méthode `.render(...)` lorsque l'on compile pour le serveur
		 * @default false
		 */
		componentApi?: boolean;
	};
	/**
	 * Une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> initiale qui sera fusionnée dans la sourcemap finale.
	 * C'est souvent la sourcemap du pré-processeur.
	 *
	 * @default null
	 */
	sourcemap?: object | string;
	/**
	 * Nom de fichier utilisé pour les <span class="vo">[sourcemaps](/docs/web#sourcemap)</span> JavaScript.
	 *
	 * @default null
	 */
	outputFilename?: string;
	/**
	 * Nom de fichier utilisé pour les <span class="vo">[sourcemaps](/docs/web#sourcemap)</span> CSS.
	 *
	 * @default null
	 */
	cssOutputFilename?: string;

	// Other Svelte 4 compiler options:
	// enableSourcemap?: EnableSourcemap; // TODO bring back? https://github.com/sveltejs/svelte/pull/6835
	// legacy?: boolean; // TODO compiler error noting the new purpose?
}

export interface ModuleCompileOptions {
	/**
	 * If `true`, causes extra code to be added that will perform runtime checks and provide debugging information during development.
	 *
	 * @default false
	 */
	dev?: boolean;
	/**
	 * If `"client"`, Svelte emits code designed to run in the browser.
	 * If `"server"`, Svelte emits code suitable for server-side rendering.
	 * If `false`, nothing is generated. Useful for tooling that is only interested in warnings.
	 *
	 * @default 'client'
	 */
	generate?: 'client' | 'server' | false;
	/**
	 * Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.
	 */
	filename?: string;
}

// The following two somewhat scary looking types ensure that certain types are required but can be undefined still

export type ValidatedModuleCompileOptions = Omit<Required<ModuleCompileOptions>, 'filename'> & {
	filename: ModuleCompileOptions['filename'];
};

export type ValidatedCompileOptions = ValidatedModuleCompileOptions &
	Omit<
		Required<CompileOptions>,
		| keyof ModuleCompileOptions
		| 'name'
		| 'legacy'
		| 'outputFilename'
		| 'cssOutputFilename'
		| 'sourcemap'
		| 'runes'
	> & {
		name: CompileOptions['name'];
		outputFilename: CompileOptions['outputFilename'];
		cssOutputFilename: CompileOptions['cssOutputFilename'];
		sourcemap: CompileOptions['sourcemap'];
		legacy: Required<Required<CompileOptions>['legacy']>;
		runes: CompileOptions['runes'];
	};

export type DeclarationKind =
	| 'var'
	| 'let'
	| 'const'
	| 'function'
	| 'import'
	| 'param'
	| 'synthetic';

export interface Binding {
	node: Identifier;
	/**
	 * - `normal`: A variable that is not in any way special
	 * - `prop`: A normal prop (possibly mutated)
	 * - `rest_prop`: A rest prop
	 * - `state`: A state variable
	 * - `derived`: A derived variable
	 * - `each`: An each block context variable
	 * - `store_sub`: A $store value
	 * - `legacy_reactive`: A `$:` declaration
	 */
	kind:
		| 'normal'
		| 'prop'
		| 'rest_prop'
		| 'state'
		| 'derived'
		| 'each'
		| 'store_sub'
		| 'legacy_reactive';
	declaration_kind: DeclarationKind;
	/**
	 * What the value was initialized with.
	 * For destructured props such as `let { foo = 'bar' } = $props()` this is `'bar'` and not `$props()`
	 */
	initial: null | Expression | FunctionDeclaration | ClassDeclaration | ImportDeclaration;
	is_called: boolean;
	references: { node: Identifier; path: SvelteNode[] }[];
	mutated: boolean;
	scope: Scope;
	/** For `legacy_reactive`: its reactive dependencies */
	legacy_dependencies: Binding[];
	/** Legacy props: the `class` in `{ export klass as class}` */
	prop_alias: string | null;
	/** If this is set, all references should use this expression instead of the identifier name */
	expression: Expression | null;
	/** If this is set, all mutations should use this expression */
	mutation: ((assignment: AssignmentExpression, context: Context<any, any>) => Expression) | null;
}

export * from './template.js';
export { Css };

// TODO this chain is a bit weird
export { ReactiveStatement } from '../phases/types.js';
