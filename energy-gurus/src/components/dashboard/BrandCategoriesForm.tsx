"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const BRAND_CATEGORIES = [
  "Panels",
  "Inverters",
  "Batteries",
  "Breakers",
  "Mounting Structure",
  "Cables",
  "Accessories",
  "Other"
];

export function BrandCategoriesForm({ initialCategories = [] }: { initialCategories?: string[] }) {
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 pt-4 border-t">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 block">Product Categories (Select all that apply)</label>
      <div className="flex flex-wrap gap-2">
        {BRAND_CATEGORIES.map(cat => (
          <Badge 
            key={cat}
            variant={categories.includes(cat) ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1.5 ${categories.includes(cat) ? "bg-amber text-ink hover:bg-amber/90" : "hover:bg-slate-100"}`}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>
      <input type="hidden" name="categories" value={JSON.stringify(categories)} />
    </div>
  );
}
