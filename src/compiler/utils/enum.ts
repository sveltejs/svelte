type Enum = { readonly [key: string]: number };

/**
    * Creates an enum from a list of strings.
    * @param args The list of strings to create the enum from.
    * @returns The enum.
*/
export default function create_enum(keys: string[], start = 0): Enum {
    const obj = {};
    for (let i = start; i < keys.length; i++) obj[keys[i]] = i;
    return obj as Enum;
}
