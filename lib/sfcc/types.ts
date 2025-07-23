import {
  Product as PrismaProduct,
  Collection as PrismaCollection,
  Cart as PrismaCart,
  Order as PrismaOrder,
  Image as PrismaImage,
  ProductOption as PrismaProductOption,
  ProductVariant as PrismaProductVariant,
  CartItem as PrismaCartItem,
  OrderItem as PrismaOrderItem,
  Page as PrismaPage,
  Menu as PrismaMenu
} from '@prisma/client';

//- CORE ENTITIES

export type Collection = PrismaCollection;

export type Product = PrismaProduct & {
  images: Image[];
  options: ProductOption[];
  variants: ProductVariant[];
  collection?: { id: string; createdAt: Date; updatedAt: Date; title: string; handle: string; description: string; } | null;
};

export type Cart = Omit<PrismaCart, 'items'> & {
  checkoutUrl: string;
  lines: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
    shippingAmount: Money;
  };
};

export type Order = Omit<PrismaOrder, 'items'> & {
  lines: OrderItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
    shippingAmount: Money;
  };
};

export type CartItem = Omit<PrismaCartItem, 'product'> & {
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOptions;
    product: Product;
  };
  cost: {
    totalAmount: Money;
  };
};

export type OrderItem = Omit<PrismaOrderItem, 'product'> & {
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOptions;
    product: Product;
  };
  cost: {
    totalAmount: Money;
  };
};

export type Image = PrismaImage;
export type ProductOption = PrismaProductOption;
export type ProductVariant = PrismaProductVariant & {
  images: Image[];
};

//- CONTENT & NAVIGATION

export type Menu = {
  title: string;
  path: string;
};

export type Page = PrismaPage & {
  seo: SEO;
};


//- UTILITY & SUPPORTING TYPES

export type Money = {
  amount: string;
  currencyCode: string;
};

export type SEO = {
  title: string;
  description: string;
};

export type SelectedOptions = {
  name: string;
  value: string;
}[];

export type Address = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
};

export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: Money;
  isDefault?: boolean;
};

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};