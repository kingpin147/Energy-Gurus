"use server";

import { db } from "@/db";
import { productSerials, products, brands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function verifySerialNumber(serialNumber: string) {
    if (!serialNumber) return null;

    const result = await db.select({
        serial: productSerials,
        product: products,
        brand: brands
    })
    .from(productSerials)
    .innerJoin(products, eq(productSerials.productId, products.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .where(eq(productSerials.serialNumber, serialNumber.trim()));

    if (result.length === 0) return { status: 'not_found' };

    return {
        status: result[0].serial.status,
        productName: result[0].product.name,
        brandName: result[0].brand.brandName,
        expiry: result[0].serial.warrantyExpiry,
        brandLogo: result[0].brand.logoUrl
    };
}
