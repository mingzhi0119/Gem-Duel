import type { MatchFlags } from '@gem-duel/domain';
import { bootstrapMatch, createMatchActor, type EnginePorts, type MatchActor } from '../index';

export const DEFAULT_FLAGS: MatchFlags = {
    roguelike: false,
    onlineAuthoritative: false,
    aiEnabled: false,
};

const hashNamespace = (value: string) => {
    let hash = 2166136261;
    for (const char of value) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const createTestRng = (seed: number, stream = 'root', forkNamespaces: string[] = []) => {
    const baseSeed = seed || 1;
    let current = baseSeed;

    const next = () => {
        current |= 0;
        current = (current + 0x6d2b79f5) | 0;
        let t = Math.imul(current ^ (current >>> 15), 1 | current);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return {
        next,
        nextInt(maxExclusive: number) {
            if (maxExclusive <= 1) {
                return 0;
            }
            return Math.floor(next() * maxExclusive);
        },
        fork(namespace: string) {
            forkNamespaces.push(`${stream}:${namespace}`);
            return createTestRng(
                baseSeed ^ hashNamespace(`${stream}:${namespace}`),
                `${stream}:${namespace}`,
                forkNamespaces
            );
        },
    };
};

export const makeTestPorts = (seed = 7) => {
    const forkNamespaces: string[] = [];
    let counter = 0;
    const ports = {
        rng: createTestRng(seed, 'root', forkNamespaces),
        clock: {
            now: () => '2026-01-01T00:00:00.000Z',
        },
        id: {
            next: (prefix = 'id') => `${prefix}-${++counter}`,
        },
    } satisfies EnginePorts;

    return {
        ports,
        forkNamespaces,
    };
};

export const createBootstrappedLocalActor = (
    seed = 7
): {
    actor: MatchActor;
    forkNamespaces: string[];
    ports: EnginePorts;
} => {
    const { ports, forkNamespaces } = makeTestPorts(seed);
    const actor = createMatchActor(
        {
            seed,
            mode: 'local',
            flags: DEFAULT_FLAGS,
        },
        ports
    );

    const bootstrapped = bootstrapMatch(actor, 'local', DEFAULT_FLAGS);
    if (!bootstrapped.ok) {
        throw new Error(bootstrapped.error.message);
    }

    return {
        actor,
        forkNamespaces,
        ports,
    };
};
