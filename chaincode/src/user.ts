import { Property } from 'fabric-contract-api';

@Object()
export class User {
    @Property()
    public username!: string;

    @Property()
    public passwordHash!: string;

    @Property()
    public secretKeyHash!: string;
}