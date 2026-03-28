export type CommandOption = {
    flags: string;
    description: string;
    defaultValue?: string | boolean;
};

export type SubCommandDefinition<TOptions = any> = {
    name: string;
    aliases?: string[];
    description: string;
    options?: CommandOption[];
    action: (options: TOptions, ...positional: string[]) => void;
};

export type CommandDefinition<TOptions = any> = {
    name: string;
    aliases?: string[];
    description: string;
    summary: string;
    options?: CommandOption[];
    action?: (options: TOptions) => void;
    subcommands?: SubCommandDefinition[];
};
