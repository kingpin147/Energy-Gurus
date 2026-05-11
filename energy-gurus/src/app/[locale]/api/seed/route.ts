import { seedDummyData } from "@/lib/seed";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await seedDummyData();
        return NextResponse.json({ message: "Seed successful" });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
