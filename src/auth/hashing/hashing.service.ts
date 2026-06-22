export abstract class HashingService {
    abstract hash(passwordOrToken: string): Promise<string>;
    abstract compare(passwordOrToken: string, hash: string): Promise<boolean>;
}