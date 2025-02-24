export interface ErrorResponse {
  status: 'error';
  message: string;
}

export interface SuccessResponse {
  status: 'success';
  message?: string;
  data?: any;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  title: string;
  variants: ProductVariant[];
}

export interface PriceChange {
  productId: string;
  variantId: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}

export interface CustomerInfo {
  firstName: string | null;
  lastName: string | null;
  fullName: string;
}

export interface OrderProduct {
  id: string;
  title: string;
  quantity: number;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo | null;
  product: OrderProduct | null;
}

export interface DiscountResponse {
  productId: string;
  productTitle: string;
  productHandle: string;
  originalPrice: number;
  discountedPrice: string;
  discountPercentage: string;
}

export interface ShopifyDiscount {
  data: {
    automaticDiscountNode: {
      id: string;
      automaticDiscount: {
        customerGets: {
          items: {
            productVariants: {
              edges: Array<{
                node: {
                  id: string;
                  product: {
                    title: string;
                    handle: string;
                  };
                  price: string;
                };
              }>;
            };
          };
          value: {
            percentage: number;
          };
        };
      };
    };
  };
}
