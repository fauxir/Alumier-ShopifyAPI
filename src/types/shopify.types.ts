export interface ShopifyDiscount {
  data: {
    automaticDiscountNode: {
      id: string;
      automaticDiscount: {
        customerGets: {
          items: {
            __typename: string;
            productVariants: {
              edges: Array<{
                node: {
                  id: string;
                  product: {
                    title: string;
                    handle: string;
                  };
                  price: string;
                }
              }>;
            };
          };
          value: {
            __typename: string;
            percentage: number;
          };
        };
      };
    };
  };
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export interface DiscountResponse {
  productId: string;
  originalPrice: number;
  discountedPrice: string;
  discountPercentage: string;
}
