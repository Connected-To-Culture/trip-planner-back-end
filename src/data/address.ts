export interface Address {
    street: string;
    unit?: string;
    city: string;
    state: string;  // 2-letter code if US, full name if not?
    zip: string;
    country: string;
}
