export type TemplateStructure =
	| string
	| undefined
	| [string, Record<string, string> | undefined, ...TemplateStructure[]];
