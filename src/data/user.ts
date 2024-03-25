import { Name } from '@data/name';
import { Address } from '@data/address';
import { City } from '@data/city';

export interface User {
    id: string;
    name: Name;
    gender: string;
    age: number;
    address: Address;
    bio: string;
    interests: City[];
    email: string;
    phone: string;
    avatar: string;  // url
    password: string;
}

