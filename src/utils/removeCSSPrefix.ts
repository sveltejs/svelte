export default function(name: string): string {
	return name.replace(/^-((webkit)|(moz)|(o)|(ms))-/, '');
}
