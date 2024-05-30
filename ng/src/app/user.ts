export class User {
    id: number;
    pass?: string;
    permissions?: number;
    name?: string;
    email?: string;
    birthDate?: string;

    constructor() { }
}

export enum UserPermissions {
    REGISTERED = 1 << 0,
    REJECTED   = 1 << 1,
    ACCEPTED   = 1 << 2,
    CUST       = 1 << 3,
    PRODUCT    = 1 << 4,
    SALE       = 1 << 5,
    ALL        = CUST | PRODUCT | SALE,
}
