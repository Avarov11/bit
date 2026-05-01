export type Category =
  | "All"
  | "Customized"
  | "Birthday"
  | "Congrats"
  | "Graduation"
  | "Get Well Soon"
  | "Bride to Be"
  | "Gender Reveal";

export interface MenuProduct {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  price: number;
  description: string;
  image: string;
  tag?: string;
}

export const menuProducts: MenuProduct[] = [
  {
    id: "birthday-brownie-box",
    name: "Birthday Brownie Box",
    category: "Birthday",
    price: 85,
    description: "Dense chocolate fudge brownies topped with rainbow sprinkles, a gold-dusted ganache finish, and a birthday candle — because every birthday deserves the good stuff.",
    image:
      "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600&h=700&fit=crop&q=80",
    tag: "Bestseller",
  },
  {
    id: "congrats-brownie-tower",
    name: "Congrats Brownie Tower",
    category: "Congrats",
    price: 90,
    description: "A stacked tower of gold-dusted dark chocolate brownies, gift-wrapped and ready to celebrate any big win in style.",
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=700&fit=crop&q=80",
    tag: "Signature",
  },
  {
    id: "graduation-brownie-platter",
    name: "Graduation Brownie Platter",
    category: "Graduation",
    price: 130,
    description: "A generous platter of mixed fudge brownies and blondies, dressed in cap-and-gown ribbon — the perfect reward after years of hard work.",
    image:
      "https://images.unsplash.com/photo-1589375462213-0f5a6a76c2c8?w=600&h=700&fit=crop&q=80",
    tag: "New",
  },
  {
    id: "get-well-brownie-bundle",
    name: "Get Well Brownie Bundle",
    category: "Get Well Soon",
    price: 75,
    description: "A cozy bundle of soft caramel blondies and classic fudge brownies — baked with warmth and sent with all the good wishes in the world.",
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=700&fit=crop&q=80",
  },
  {
    id: "bride-to-be-brownie-set",
    name: "Bride to Be Brownie Set",
    category: "Bride to Be",
    price: 110,
    description: "Blush-frosted blondies adorned with edible pearls and rose-gold dust — bridal elegance captured in every single bite.",
    image:
      "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&h=700&fit=crop&q=80",
    tag: "Signature",
  },
  {
    id: "gender-reveal-brownie-box",
    name: "Gender Reveal Brownie Box",
    category: "Gender Reveal",
    price: 95,
    description: "Chocolate shell brownies with a surprise pink or blue fudge centre inside — crack one open and let the reveal begin.",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=700&fit=crop&q=80",
  },
  {
    id: "customized-brownie-box",
    name: "Customized Brownie Box",
    category: "Customized",
    price: 100,
    description: "Fully bespoke brownie box — you choose the size, flavour, frosting colour, toppings, and personalised message. Made exactly how you imagined it.",
    image:
      "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600&h=700&fit=crop&q=80",
    tag: "Custom",
  },
  {
    id: "walnut-brownie-box",
    name: "Walnut Brownie Box",
    category: "Customized",
    price: 80,
    description: "Classic dark chocolate brownies packed with toasted walnut pieces — rich, chewy, and impossible to stop at one.",
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=700&fit=crop&q=80",
    tag: "New",
  },
];
