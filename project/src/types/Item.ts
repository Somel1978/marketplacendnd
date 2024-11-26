export interface Item {
  id: number;
  type: string;
  name: string;
  price: number;
  baseItem: string;
  rarity: string;
  attunement: string | null;
  requirements: string | null;
  weight: number | null;
  source: string;
  image: string | null;
  link: string | null;
}