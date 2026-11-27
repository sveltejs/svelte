import ts from 'typescript';
import { features } from 'web-features';

/**
 * Maps compat-key suffixes under `javascript.operators` and
 * `javascript.statements` (and a few other `javascript.*` subtrees) to the
 * `ts.SyntaxKind`s they can match plus a detection predicate. Indexing by
 * `SyntaxKind` avoids running every predicate on every AST node.
 *
 * @type {Record<string, { kinds: ts.SyntaxKind[]; predicate: (node: ts.Node) => boolean }>}
 */
const SYNTAX_PREDICATES = {
	nullish_coalescing: {
		kinds: [ts.SyntaxKind.BinaryExpression],
		predicate: (node) =>
			ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
	},
	nullish_coalescing_assignment: {
		kinds: [ts.SyntaxKind.BinaryExpression],
		predicate: (node) =>
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken
	},
	logical_or_assignment: {
		kinds: [ts.SyntaxKind.BinaryExpression],
		predicate: (node) =>
			ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarEqualsToken
	},
	logical_and_assignment: {
		kinds: [ts.SyntaxKind.BinaryExpression],
		predicate: (node) =>
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken
	},
	optional_chaining: {
		kinds: [
			ts.SyntaxKind.PropertyAccessExpression,
			ts.SyntaxKind.ElementAccessExpression,
			ts.SyntaxKind.CallExpression
		],
		predicate: (node) =>
			(ts.isPropertyAccessExpression(node) ||
				ts.isElementAccessExpression(node) ||
				ts.isCallExpression(node)) &&
			node.questionDotToken !== undefined
	},
	spread: {
		kinds: [ts.SyntaxKind.SpreadElement, ts.SyntaxKind.SpreadAssignment],
		predicate: () => true
	},
	destructuring: {
		kinds: [ts.SyntaxKind.ObjectBindingPattern, ts.SyntaxKind.ArrayBindingPattern],
		predicate: () => true
	},
	arrow_functions: {
		kinds: [ts.SyntaxKind.ArrowFunction],
		predicate: () => true
	},
	try_catch_optional_binding: {
		kinds: [ts.SyntaxKind.CatchClause],
		predicate: (node) => ts.isCatchClause(node) && node.variableDeclaration === undefined
	},
	async_iteration: {
		kinds: [ts.SyntaxKind.ForOfStatement],
		predicate: (node) => ts.isForOfStatement(node) && node.awaitModifier !== undefined
	},
	for_await: {
		kinds: [ts.SyntaxKind.ForOfStatement],
		predicate: (node) => ts.isForOfStatement(node) && node.awaitModifier !== undefined
	},
	private_class_fields: {
		kinds: [ts.SyntaxKind.PrivateIdentifier],
		predicate: () => true
	},
	async_generator_function: {
		kinds: [
			ts.SyntaxKind.FunctionDeclaration,
			ts.SyntaxKind.FunctionExpression,
			ts.SyntaxKind.MethodDeclaration
		],
		predicate: (node) =>
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isMethodDeclaration(node)) &&
			node.asteriskToken !== undefined &&
			(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false)
	},
	generator_function: {
		kinds: [
			ts.SyntaxKind.FunctionDeclaration,
			ts.SyntaxKind.FunctionExpression,
			ts.SyntaxKind.MethodDeclaration
		],
		predicate: (node) =>
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isMethodDeclaration(node)) &&
			node.asteriskToken !== undefined &&
			!(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false)
	},
	async_function: {
		kinds: [
			ts.SyntaxKind.FunctionDeclaration,
			ts.SyntaxKind.FunctionExpression,
			ts.SyntaxKind.ArrowFunction,
			ts.SyntaxKind.MethodDeclaration
		],
		predicate: (node) =>
			(ts.isFunctionDeclaration(node) ||
				ts.isFunctionExpression(node) ||
				ts.isArrowFunction(node) ||
				ts.isMethodDeclaration(node)) &&
			(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false) &&
			node.asteriskToken === undefined
	},
	classes: {
		kinds: [ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.ClassExpression],
		predicate: () => true
	},
	let_const: {
		kinds: [ts.SyntaxKind.VariableDeclarationList],
		predicate: (node) =>
			ts.isVariableDeclarationList(node) &&
			((node.flags & ts.NodeFlags.Let) !== 0 || (node.flags & ts.NodeFlags.Const) !== 0)
	},
	template_literals: {
		kinds: [ts.SyntaxKind.TemplateExpression, ts.SyntaxKind.NoSubstitutionTemplateLiteral],
		predicate: () => true
	}
};

/**
 * Walk `web-features` once and partition every `compat_features` path
 * into the lookup tables the AST walker uses.
 */
function build_detection_maps() {
	/** @type {Map<string, string>} identifier name → feature_id */
	const globals = new Map();
	/** @type {Map<string, Map<string, string>>} member → type → feature_id */
	const members_by_name = new Map();
	/** @type {Map<string, string>} string-literal value → feature_id */
	const string_literals = new Map();
	/** @type {Map<ts.SyntaxKind, Array<{ predicate: (n: ts.Node) => boolean, feature_id: string }>>} */
	const syntax_by_kind = new Map();
	/** @type {Set<string>} */
	const seen_syntax = new Set();

	const add_member = (
		/** @type {string} */ type,
		/** @type {string} */ member,
		/** @type {string} */ feature_id
	) => {
		let by_type = members_by_name.get(member);
		if (!by_type) {
			by_type = new Map();
			members_by_name.set(member, by_type);
		}
		// Only set if not already present — the first feature claiming a
		// (type, member) pair wins. (Multiple features can map to the same
		// pair via duplicated compat paths; we just need any.)
		if (!by_type.has(type)) by_type.set(type, feature_id);
	};

	for (const [feature_id, feature] of Object.entries(features)) {
		if (!('compat_features' in feature) || !feature.compat_features) continue;
		for (const path of feature.compat_features) {
			const parts = path.split('.');

			// `api.X` → global identifier (constructor or function), e.g.
			// `api.ResizeObserver`, `api.structuredClone`.
			if (parts[0] === 'api' && parts.length === 2) {
				globals.set(parts[1], feature_id);
				continue;
			}

			// `api.X.Y` → member access on type X. E.g.
			// `api.HTMLElement.inert`, `api.ResizeObserverEntry.contentBoxSize`.
			if (parts[0] === 'api' && parts.length === 3) {
				add_member(parts[1], parts[2], feature_id);
				continue;
			}

			// `javascript.builtins.X` → global like Promise, Symbol, Proxy.
			if (parts[0] === 'javascript' && parts[1] === 'builtins' && parts.length === 3) {
				globals.set(parts[2], feature_id);
				continue;
			}

			// `javascript.builtins.X.Y` → method/property on type X.
			// We also accept the `ArrayConstructor`-style mapping for static
			// methods: when the AST walker sees `Array.from(...)`, the
			// receiver type's symbol name is `ArrayConstructor`, not `Array`.
			if (parts[0] === 'javascript' && parts[1] === 'builtins' && parts.length === 4) {
				add_member(parts[2], parts[3], feature_id);
				add_member(`${parts[2]}Constructor`, parts[3], feature_id);
				continue;
			}

			// `javascript.*` syntax: try the second segment first (covers
			// `javascript.operators.X` and `javascript.statements.X`), then
			// the last segment (covers `javascript.classes.private_class_fields`
			// and similar).
			if (parts[0] === 'javascript' && parts.length >= 3) {
				const candidates = [parts[2], parts[parts.length - 1]];
				for (const key of candidates) {
					if (Object.hasOwn(SYNTAX_PREDICATES, key)) {
						const dedupe_key = `${key}:${feature_id}`;
						if (!seen_syntax.has(dedupe_key)) {
							seen_syntax.add(dedupe_key);
							const { kinds, predicate } = SYNTAX_PREDICATES[key];
							for (const kind of kinds) {
								let list = syntax_by_kind.get(kind);
								if (!list) {
									list = [];
									syntax_by_kind.set(kind, list);
								}
								list.push({ predicate, feature_id });
							}
						}
						break;
					}
				}
				continue;
			}
		}
	}

	return { globals, members_by_name, string_literals, syntax_by_kind };
}

const MAPS = build_detection_maps();

/**
 * Versions and friendly names for synthetic feature IDs registered via
 * `register_extra_rules` — APIs the type-aware walker can see but that
 * `web-features` doesn't (yet) catalogue. `versions_for_feature` consults
 * this map before falling back to `web-features` lookups.
 *
 * @type {Map<string, { name: string, versions: Record<string, string | null>, baseline_year: number | null }>}
 */
const EXTRA_FEATURE_INFO = new Map();

/** @type {Map<string, number | null>} */
const YEAR_CACHE = new Map();

/**
 * Register additional detection rules for APIs the `web-features` dataset
 * doesn't track yet. Two rule shapes are accepted:
 *
 *   - **Member access**: `{ receiver_type, member, ... }` — flags
 *     `expr.member` when `expr`'s type resolves to `receiver_type`.
 *     Equivalent to a `api.X.Y` rule auto-derived from web-features.
 *
 *   - **String literal**: `{ string_literal, ... }` — flags any
 *     occurrence of the literal value in source. Used for API options
 *     that are string-typed (e.g. `{ box: 'device-pixel-content-box' }`).
 *     The walker can be tightened later with a contextual-type check if
 *     false positives ever surface; for now an exact match is enough
 *     (these strings are too specific to occur incidentally).
 *
 * Each rule contributes its `feature_id`, per-browser versions,
 * baseline year, and display name to the shared lookup tables.
 *
 * @param {Array<{
 *   feature_id: string,
 *   name: string,
 *   baseline_year: number,
 *   versions: Record<string, string | null>,
 *   receiver_type?: string,
 *   member?: string,
 *   string_literal?: string
 * }>} rules
 */
export function register_extra_rules(rules) {
	for (const rule of rules) {
		if (rule.receiver_type && rule.member) {
			let by_type = MAPS.members_by_name.get(rule.member);
			if (!by_type) {
				by_type = new Map();
				MAPS.members_by_name.set(rule.member, by_type);
			}
			// Don't overwrite an existing web-features rule; that's canonical.
			if (!by_type.has(rule.receiver_type)) {
				by_type.set(rule.receiver_type, rule.feature_id);
			}
		} else if (rule.string_literal) {
			if (!MAPS.string_literals.has(rule.string_literal)) {
				MAPS.string_literals.set(rule.string_literal, rule.feature_id);
			}
		}
		EXTRA_FEATURE_INFO.set(rule.feature_id, {
			name: rule.name,
			baseline_year: rule.baseline_year,
			versions: rule.versions
		});
		YEAR_CACHE.set(rule.feature_id, rule.baseline_year);
	}
}

/** @type {ts.CompilerOptions} */
const COMPILER_OPTIONS = {
	allowJs: true,
	checkJs: false,
	target: ts.ScriptTarget.ESNext,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	moduleDetection: ts.ModuleDetectionKind.Force,
	lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
	strict: false,
	noEmit: true,
	skipLibCheck: true,
	isolatedModules: true,
	noErrorTruncation: true
};

/**
 * Compile bundle files into a single `ts.Program` so type-checking is
 * amortised across all of them.
 *
 * @param {string[]} files
 * @param {ts.CompilerHost} [host]
 */
function build_program(files, host) {
	const program = ts.createProgram(files, COMPILER_OPTIONS, host);
	const checker = program.getTypeChecker();
	return { program, checker };
}

/**
 * Collect the names of a type and its base types so a `member` lookup
 * keyed on (say) `HTMLElement` matches a receiver typed as
 * `HTMLDivElement`. Also includes the apparent type to catch primitives
 * (`'foo'` apparent-types to `String`).
 *
 * @param {ts.Type} type
 * @param {ts.TypeChecker} checker
 */
function get_type_names(type, checker) {
	const names = new Set();
	const constituents = type.isUnionOrIntersection() ? type.types : [type];
	for (const t of constituents) {
		const symbol = t.getSymbol() ?? t.aliasSymbol;
		if (symbol) names.add(symbol.getName());
		for (const base of t.getBaseTypes?.() ?? []) {
			const base_symbol = base.getSymbol() ?? base.aliasSymbol;
			if (base_symbol) names.add(base_symbol.getName());
		}
		const apparent = checker.getApparentType(t);
		if (apparent && apparent !== t) {
			const apparent_symbol = apparent.getSymbol() ?? apparent.aliasSymbol;
			if (apparent_symbol) names.add(apparent_symbol.getName());
		}
	}
	return names;
}

/**
 * Cheap test for whether a symbol refers to a global binding (declared
 * in a lib.d.ts or ambient module) rather than a user-defined local.
 *
 * @param {ts.Symbol | undefined} symbol
 */
function is_global_binding(symbol) {
	if (!symbol) return true; // unresolved → assume global
	const declarations = symbol.getDeclarations() ?? [];
	if (declarations.length === 0) return true;
	for (const decl of declarations) {
		const file_name = decl.getSourceFile().fileName;
		if (file_name.includes('/lib.') && file_name.endsWith('.d.ts')) return true;
	}
	return false;
}

/**
 * Walk a TS source file collecting feature IDs into `flagged`.
 *
 * @param {ts.SourceFile} source
 * @param {ts.TypeChecker | null} checker
 *   When `null`, type-aware checks (member access) are skipped. Used for
 *   the compiler-output fixtures which are parsed without a Program.
 * @param {Set<string>} flagged
 * @param {number} [min_year]
 *   When > 0, skip features whose Baseline year is `<= min_year` (or unset)
 *   before consulting the TypeChecker.
 */
function walk_source(source, checker, flagged, min_year = 0) {
	/** @param {string} feature_id */
	function is_interesting(feature_id) {
		if (flagged.has(feature_id)) return false;
		if (min_year === 0) return true;
		return (baseline_year_for_feature(feature_id) ?? 0) > min_year;
	}

	/** @param {ts.Node} node */
	function visit(node) {
		// Syntax predicates indexed by SyntaxKind run regardless of whether we
		// have a checker.
		const syntax_preds = MAPS.syntax_by_kind.get(node.kind);
		if (syntax_preds) {
			for (let i = 0; i < syntax_preds.length; i++) {
				const { predicate, feature_id } = syntax_preds[i];
				if (is_interesting(feature_id) && predicate(node)) {
					flagged.add(feature_id);
				}
			}
		}

		// Global identifier detection.
		if (node.kind === ts.SyntaxKind.Identifier) {
			const identifier = /** @type {ts.Identifier} */ (node);
			const feature_id = MAPS.globals.get(identifier.text);
			if (feature_id && is_interesting(feature_id)) {
				const parent = identifier.parent;
				if (
					!(ts.isPropertyAccessExpression(parent) && parent.name === identifier) &&
					!ts.isPropertyAssignment(parent) &&
					!ts.isMethodDeclaration(parent) &&
					!ts.isPropertySignature(parent) &&
					(!checker || is_global_binding(checker.getSymbolAtLocation(identifier)))
				) {
					flagged.add(feature_id);
				}
			}
		} else if (
			node.kind === ts.SyntaxKind.StringLiteral ||
			node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
		) {
			// String-literal detection. The walker matches by value alone;
			// false positives are theoretically possible but the literal
			// values we care about (e.g. `'device-pixel-content-box'`) are
			// distinctive enough that one hasn't been observed.
			const literal = /** @type {ts.StringLiteral | ts.NoSubstitutionTemplateLiteral} */ (node);
			const feature_id = MAPS.string_literals.get(literal.text);
			if (feature_id && is_interesting(feature_id)) {
				flagged.add(feature_id);
			}
		} else if (checker && node.kind === ts.SyntaxKind.PropertyAccessExpression) {
			// Member access detection (requires the checker). Pre-filter by member
			// name and `is_interesting` so we skip TypeChecker queries for
			// untracked or already-detected properties.
			const prop = /** @type {ts.PropertyAccessExpression} */ (node);
			const by_type = MAPS.members_by_name.get(prop.name.text);
			if (by_type) {
				let relevant = false;
				for (const feature_id of by_type.values()) {
					if (is_interesting(feature_id)) {
						relevant = true;
						break;
					}
				}
				if (relevant) {
					const receiver_type = checker.getTypeAtLocation(prop.expression);
					const type_names = get_type_names(receiver_type, checker);
					for (const type_name of type_names) {
						const feature_id = by_type.get(type_name);
						if (feature_id && is_interesting(feature_id)) {
							flagged.add(feature_id);
							break;
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(source);
}

/**
 * Build a single in-memory `ts.Program` covering all supplied virtual files
 * so `lib.*.d.ts` parsing and binding are paid only once across all runtime
 * and per-feature bundles.
 *
 * @param {Map<string, string>} files Map of absolute virtual file path → source code.
 */
export function create_detector(files) {
	/** @type {Map<string, string>} */
	const normalized = new Map();
	for (const [file_name, content] of files) {
		normalized.set(file_name.replace(/\\/g, '/'), content);
	}

	const default_host = ts.createCompilerHost(COMPILER_OPTIONS);
	const orig_get_source_file = default_host.getSourceFile.bind(default_host);
	const orig_file_exists = default_host.fileExists.bind(default_host);
	const orig_read_file = default_host.readFile.bind(default_host);

	/** @type {ts.CompilerHost} */
	const host = {
		...default_host,
		getSourceFile(file_name, language_version, ...rest) {
			const content = normalized.get(file_name.replace(/\\/g, '/'));
			if (content !== undefined) {
				return ts.createSourceFile(file_name, content, language_version, true);
			}
			return orig_get_source_file(file_name, language_version, ...rest);
		},
		fileExists(file_name) {
			return normalized.has(file_name.replace(/\\/g, '/')) || orig_file_exists(file_name);
		},
		readFile(file_name) {
			const content = normalized.get(file_name.replace(/\\/g, '/'));
			return content !== undefined ? content : orig_read_file(file_name);
		}
	};

	const { program, checker } = build_program([...normalized.keys()], host);

	return {
		/**
		 * Detect features used across a subset of the program's files.
		 *
		 * @param {string[]} file_paths
		 * @param {{ min_year?: number }} [options]
		 * @returns {Set<string>}
		 */
		detect(file_paths, options = {}) {
			/** @type {Set<string>} */
			const flagged = new Set();
			const min_year = options.min_year ?? 0;
			for (const file of file_paths) {
				const source = program.getSourceFile(file.replace(/\\/g, '/'));
				if (!source) continue;
				walk_source(source, checker, flagged, min_year);
			}
			return flagged;
		}
	};
}

/**
 * Detect features used in a set of bundle files on disk. Returns the union of
 * web-features IDs flagged across all files.
 *
 * @param {string[]} bundle_files Absolute paths to JS/TS files.
 * @returns {Set<string>}
 */
export function detect_features(bundle_files) {
	const { program, checker } = build_program(bundle_files);
	/** @type {Set<string>} */
	const flagged = new Set();
	for (const file of bundle_files) {
		const source = program.getSourceFile(file);
		if (!source) continue;
		walk_source(source, checker, flagged);
	}
	return flagged;
}

/**
 * Detect features used in a single in-memory source string. No type
 * checker (so member-based rules silently skip) — useful for the
 * compiler-output fixtures, where syntax-level detection is sufficient.
 *
 * @param {string} source_text
 * @returns {Set<string>}
 */
export function detect_features_in_text(source_text) {
	const source = ts.createSourceFile(
		'fixture.js',
		source_text,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.JS
	);
	/** @type {Set<string>} */
	const flagged = new Set();
	walk_source(source, null, flagged);
	return flagged;
}

/**
 * Per-browser minimum versions for a feature ID. Consults
 * supplemental rules first (from `register_extra_rules`), then falls
 * back to `web-features`. Returns null when neither has data.
 *
 * @param {string} feature_id
 */
export function versions_for_feature(feature_id) {
	const extra = EXTRA_FEATURE_INFO.get(feature_id);
	if (extra) return extra.versions;
	const feature = features[feature_id];
	if (!feature || !('status' in feature)) return null;
	return /** @type {Record<string, string> | null} */ (
		/** @type {unknown} */ (feature.status.support)
	);
}

/**
 * Baseline year for a feature. Returns `null` for features without a
 * Baseline date (limited availability, supplemental rules without a
 * year, or absent from the dataset).
 *
 * @param {string} feature_id
 */
export function baseline_year_for_feature(feature_id) {
	const cached = YEAR_CACHE.get(feature_id);
	if (cached !== undefined) return cached;

	const extra = EXTRA_FEATURE_INFO.get(feature_id);
	if (extra) {
		YEAR_CACHE.set(feature_id, extra.baseline_year);
		return extra.baseline_year;
	}

	const feature = features[feature_id];
	if (!feature || !('status' in feature)) {
		YEAR_CACHE.set(feature_id, null);
		return null;
	}

	const status = /** @type {{ baseline_low_date?: string }} */ (feature.status);
	const year = status.baseline_low_date ? Number(status.baseline_low_date.slice(0, 4)) : null;
	YEAR_CACHE.set(feature_id, year);
	return year;
}
