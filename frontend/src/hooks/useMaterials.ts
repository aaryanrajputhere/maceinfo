import { useState, useEffect } from "react";
import type { Material } from "../types/materials";

export interface FilterOptions {
  searchTerm?: string;
  category?: string;
  sortBy?: string;
  availability?: string;
  priceRange?: string;
}

export const useMaterials = (filters?: FilterOptions) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/materials`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        let materialsArray: any[] = [];

        if (Array.isArray(data)) {
          materialsArray = data;
        } else if (data && Array.isArray(data.materials)) {
          materialsArray = data.materials;
        } else if (data && Array.isArray(data.data)) {
          materialsArray = data.data;
        } else {
          console.error("Unexpected API response format:", data);
          throw new Error("API response is not in expected format");
        }

        // Assign sequential IDs from 1 to n
        const materialsWithIds = materialsArray.map(
          (material: any, index: number) => {
            return {
              id: index + 1,
              Category: (material.category || "").trim(),
              "Item Name": (material.itemName || "").trim(),
              "Size/Option": (material.size || "").trim(),
              Unit: material.unit,
              Price: material.price,
              image: material.image,
              Vendors: material.vendors,
              createdAt: material.createdAt,
            };
          }
        );


        setAllMaterials(materialsWithIds);
        setMaterials(materialsWithIds);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setMaterials([]); // Set empty array on error
        setAllMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Filter and sort materials when filters change
  useEffect(() => {
    if (!filters || allMaterials.length === 0) {
      setMaterials(allMaterials);
      return;
    }

    let filteredMaterials = [...allMaterials];

    // Apply search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredMaterials = filteredMaterials.filter(
        (material) =>
          material["Item Name"]?.toLowerCase().includes(searchLower) ||
          material.Category?.toLowerCase().includes(searchLower) ||
          material["Size/Option"]?.toLowerCase().includes(searchLower) ||
          (Array.isArray(material.Vendors)
            ? material.Vendors.some((vendor: string) =>
              vendor.toLowerCase().includes(searchLower)
            )
            : material.Vendors?.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter (case-insensitive)
    if (filters.category && filters.category.trim()) {
      const filterCategoryLower = filters.category.toLowerCase().trim();
      filteredMaterials = filteredMaterials.filter(
        (material) => material.Category?.toLowerCase().trim() === filterCategoryLower
      );
    }


    // Apply price range filter
    if (filters.priceRange && filters.priceRange !== "") {
      filteredMaterials = filteredMaterials.filter((material) => {
        const price =
          parseFloat(String(material.Price).replace(/[^0-9.-]/g, "")) || 0;

        switch (filters.priceRange) {
          case "0-50":
            return price <= 50;
          case "50-100":
            return price > 50 && price <= 100;
          case "100-500":
            return price > 100 && price <= 500;
          case "500+":
            return price > 500;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (filters.sortBy && filters.sortBy !== "") {
      filteredMaterials.sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc":
            const priceA =
              parseFloat(String(a.Price).replace(/[^0-9.-]/g, "")) || 0;
            const priceB =
              parseFloat(String(b.Price).replace(/[^0-9.-]/g, "")) || 0;
            return priceA - priceB;
          case "price-desc":
            const priceDescA =
              parseFloat(String(a.Price).replace(/[^0-9.-]/g, "")) || 0;
            const priceDescB =
              parseFloat(String(b.Price).replace(/[^0-9.-]/g, "")) || 0;
            return priceDescB - priceDescA;
          case "name-asc":
            return (a["Item Name"] || "").localeCompare(b["Item Name"] || "");
          case "name-desc":
            return (b["Item Name"] || "").localeCompare(a["Item Name"] || "");
          default:
            return 0;
        }
      });
    }

    setMaterials(filteredMaterials);
  }, [filters, allMaterials]);

  return { materials, loading, error };
};
