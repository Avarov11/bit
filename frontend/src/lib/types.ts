export interface DbProduct {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: "Customized" | "Accessories" | "Boxes";
  subcategory: string | null;
  price: number;
  image_url: string | null;
  tag: string | null;
  is_customizable: boolean;
  is_active: boolean;
  sort_order: number;
}
