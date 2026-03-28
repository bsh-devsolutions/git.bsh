export type CommandDefinition<TOptions = Record<string, unknown>> = {
    name: string;
    description: string;
    summary: string;
    options?: {
        flags: string;
        description: string;
        defaultValue?: string | boolean;
    }[];
    action: (options: TOptions) => void;
};
