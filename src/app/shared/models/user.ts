import { Role } from './role';

export class User {
    username: string;
    roles: [Role];
    access_token: string;
}