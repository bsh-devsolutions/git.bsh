export type Config = {
    logger: {
        level: 'info' | 'debug';
        file: {
            enable: boolean,
            path: string,
        }
    },
    commit: {
        message: {
            format: string;
            types: string[];
            scopes: string[];
        }
    }
}