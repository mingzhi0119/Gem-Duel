import YAML from 'yaml';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export const sortKeysDeep = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map((item) => sortKeysDeep(item));
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, nestedValue]) => [key, sortKeysDeep(nestedValue)])
    );
};

export const serializeStableJson = (value: unknown) =>
    `${JSON.stringify(sortKeysDeep(value), null, 2)}\n`;

export const serializeStableYaml = (value: unknown) =>
    YAML.stringify(sortKeysDeep(value), {
        lineWidth: 0,
    });
