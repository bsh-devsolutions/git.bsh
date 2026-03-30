import { Command } from 'commander';
import { errorHandlingMiddleware } from './global-error';

export default function middleware(program: Command): Promise<void> {
    return errorHandlingMiddleware(program);
}
