export interface ShopifyOrdersResponse {
  data: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          customer?: {
            firstName?: string;
            lastName?: string;
          };
          lineItems: {
            edges: Array<{
              node: {
                quantity: number;
                product: {
                  id: string;
                  title: string;
                };
              };
            }>;
          };
        };
      }>;
    };
  };
}
