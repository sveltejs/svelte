export default function get_prefix(str?: string): string {
    const standard_prefix = 'svelte';
    if (!str
        || typeof str !== 'string') return standard_prefix;
    str = str.replace(/^[^_\-a-z]+|[^_\-a-z0-9]/gi, '');
    return str.length
        ? str
        : standard_prefix;
}