import { describe, expect, it } from 'vitest';
import { GameCommandSchema, SCHEMA_VERSION } from '../index';

describe('contracts schemas', () => {
    it('accepts a valid deterministic command payload', () => {
        const command = GameCommandSchema.parse({
            type: 'TAKE_GEM',
            color: 'blue',
        });

        expect(command.type).toBe('TAKE_GEM');
        expect(SCHEMA_VERSION).toBe('2.0.0');
    });
});
