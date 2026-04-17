import type { Input as AsyncApiInput } from '@asyncapi/parser';
import { SCHEMA_VERSION } from './shared/enums';
import { openApiComponentSchemas } from './openapi';
import { WS_MESSAGE_REGISTRATIONS } from './websocket';

const channelName = 'roomStream';
const channelAddress = '/ws/rooms/{roomId}';

const messageMap = Object.fromEntries(
    WS_MESSAGE_REGISTRATIONS.map((registration) => [
        registration.componentName,
        {
            $ref: `#/components/messages/${registration.componentName}`,
        },
    ])
);

export interface AsyncApiDocument {
    [key: string]: unknown;
    asyncapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    defaultContentType: string;
    servers: Record<string, unknown>;
    channels: Record<string, unknown>;
    operations: Record<string, unknown>;
    components: {
        schemas: Record<string, unknown>;
        messages: Record<string, unknown>;
    };
}

export interface AsyncApiDiagnostic {
    message: string;
    severity: number;
}

export const asyncApiDocument: AsyncApiDocument = {
    asyncapi: '3.0.0',
    info: {
        title: 'Gem Duel Realtime Contracts',
        version: SCHEMA_VERSION,
        description:
            'Authoritative room-service WebSocket protocol with filtered snapshots, seq, resync, and spectator flows.',
    },
    defaultContentType: 'application/json',
    servers: {
        roomService: {
            host: '{host}',
            pathname: channelAddress,
            protocol: 'ws',
            description: 'Local room-service realtime transport.',
            variables: {
                host: {
                    default: 'localhost:8787',
                },
            },
        },
    },
    channels: {
        [channelName]: {
            address: channelAddress,
            description: 'Bidirectional room lifecycle and match event stream.',
            parameters: {
                roomId: {
                    description: 'Authoritative room identifier.',
                    examples: ['room-1'],
                },
            },
            messages: messageMap,
        },
    },
    operations: Object.fromEntries(
        WS_MESSAGE_REGISTRATIONS.map((registration) => [
            registration.operationId,
            {
                action: registration.action,
                summary: registration.summary,
                channel: {
                    $ref: `#/channels/${channelName}`,
                },
                messages: [
                    {
                        $ref: `#/channels/${channelName}/messages/${registration.componentName}`,
                    },
                ],
            },
        ])
    ),
    components: {
        schemas: openApiComponentSchemas,
        messages: Object.fromEntries(
            WS_MESSAGE_REGISTRATIONS.map((registration) => [
                registration.componentName,
                {
                    name: registration.type,
                    title: registration.componentName,
                    summary: registration.summary,
                    payload: {
                        $ref: `#/components/schemas/${registration.componentName}`,
                    },
                },
            ])
        ),
    },
} as AsyncApiDocument;

export const validateAsyncApiDocument = async (): Promise<AsyncApiDiagnostic[]> => {
    const { Parser } = await import('@asyncapi/parser');
    const parser = new Parser();
    const diagnostics = await parser.validate(asyncApiDocument as AsyncApiInput);

    return diagnostics.filter((diagnostic) => diagnostic.severity <= 1) as AsyncApiDiagnostic[];
};
