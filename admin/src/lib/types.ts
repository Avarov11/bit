export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface CartItemCustomization {
  shape?: string;
  flavor?: string;
  color?: string;
  toppings?: string[];
  message?: string;
  stickerUrl?: string;
  imageUrl?: string;
  candleUrl?: string;
  balloonUrl?: string;
  cardUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customization: CartItemCustomization;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_method: "pickup" | "delivery";
  delivery_address: string | null;
  pickup_date: string;
  pickup_time: string;
  payment_method: "cash" | "card" | "sadad_online";
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  language: "en" | "ar";
  status: OrderStatus;
  sticker_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: "Customized" | "Accessories" | "Boxes";
  subcategory: string | null;
  price: number;
  image_url: string | null;
  tag: "Bestseller" | "Signature" | "New" | "Custom" | null;
  is_customizable: boolean;
  is_active: boolean;
  sort_order: number;
  allowed_shapes: string[];
  allowed_flavors: string[];
  allowed_toppings: string[];
  allowed_sauces: string[];
  created_at: string;
  updated_at: string;
}
