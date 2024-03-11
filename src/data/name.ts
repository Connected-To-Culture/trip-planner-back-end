export type Title = 'Mr.' | 'Mrs.' | 'Ms.' | 'Dr.' | 'Prof.' | 'Mx.' | 'Other';

export interface Name {
  title: Title;
  firstName: string;
  middleName?: string;
  lastName: string;
}
