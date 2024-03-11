
export interface City {  // include activities, spots, fellows, and other things..
  id: string;  // abbr for quick reference?
  name: string;
  description: string;
  category: string;  // outdoor, gallery, club, etc.
  images: string[];  // images uploaded by users/owners
  state?: string;  // not sure
  country: string;
}
