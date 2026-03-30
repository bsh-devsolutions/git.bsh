import { Command } from "commander";
import { applyCommandMeta, applyOptions, applyPositional, nameAndArgs } from "./utils";
import type { CommandDefinition } from "@definition";
import { BshError } from "@lib/errors";

export default (program: Command, commands: CommandDefinition[]) => {
    commands.forEach((cmd) => {
        const sub = program
            .command(nameAndArgs(cmd.name, cmd.argumentSyntax), {
                hidden: cmd.hidden,
                isDefault: cmd.isDefault,
            })
            .description(cmd.description)
            .summary(cmd.summary ?? '');

        for (const a of cmd.aliases ?? []) sub.alias(a);

        if (cmd.positional?.length) applyPositional(sub, cmd.positional);
        else if (cmd.argumentsPattern) sub.arguments(cmd.argumentsPattern);

        applyCommandMeta(sub, cmd);
        applyOptions(sub, cmd.options);

        if (cmd.subcommands?.length) {
            for (const sc of cmd.subcommands) {
                const nested = sub
                    .command(nameAndArgs(sc.name, sc.argumentSyntax), {
                        hidden: sc.hidden,
                        isDefault: sc.isDefault,
                    })
                    .description(sc.description);

                if (sc.summary) nested.summary(sc.summary);

                for (const a of sc.aliases ?? []) nested.alias(a);

                if (sc.positional?.length) applyPositional(nested, sc.positional);
                else if (sc.argumentsPattern) nested.arguments(sc.argumentsPattern);

                applyCommandMeta(nested, sc);
                applyOptions(nested, sc.options);

                nested.action((...actionArgs: unknown[]) => {
                    const options = actionArgs[actionArgs.length - 2] as Record<
                        string,
                        unknown
                    >;
                    const positionals = actionArgs.slice(0, -2) as string[];
                    sc.action(options as never, ...positionals);
                });
            }
        } else if (cmd.action) {
            sub.action(cmd.action);
        } else {
            throw new BshError(
                500,
                `Command "${cmd.name}" must define action or subcommands ${cmd.name}`,
            );
        }
    });
}
