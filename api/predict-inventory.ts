// api/ai/predict-inventory.ts

export const config = {
  runtime: "edge", // optional: edge runtime (fast)
};

export default async function handler(req: Request): Promise<Response> {
  const suggestions = [
    {
      sku: "CAB-100",
      name: "Copper Cable Roll",
      daysToStockout: 6,
      recommendedOrderQty: 150,
      confidence: 0.88,
      currentStock: 40,
      vendor: "Bharat Supplies"
    },
    {
      sku: "LED-24",
      name: "24W LED Panel",
      daysToStockout: 9,
      recommendedOrderQty: 40,
      confidence: 0.78,
      currentStock: 12,
      vendor: "BrightLights"
    },
    {
      sku: "BRK-2",
      name: "Brake Pad Small",
      daysToStockout: 2,
      recommendedOrderQty: 220,
      confidence: 0.92,
      currentStock: 6,
      vendor: "AutoParts Co"
    }
  ];

  return new Response(
    JSON.stringify({ suggestions }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30"
      }
    }
  );
}

