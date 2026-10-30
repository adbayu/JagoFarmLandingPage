import { useEffect, useState } from "react";
import { getBrowserClient } from "./supabase.js";

// Fetch products from Supabase (client-side)
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchProducts() {
      try {
        const { data, error: fetchError } = await getBrowserClient()
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true });
        
        if (fetchError) throw fetchError;
        
        if (mounted) {
          // Map snake_case to camelCase
          const mapped = data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            image: p.image,
            category: p.category,
            categoryLabel: p.category_label,
            icon: p.icon,
            status: p.status,
          }));
          setProducts(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchProducts();
    
    return () => { mounted = false; };
  }, []);

  return { products, loading, error };
}

// Fetch projects from Supabase (client-side)
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchProjects() {
      try {
        const { data, error: fetchError } = await getBrowserClient()
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });
        
        if (fetchError) throw fetchError;
        
        if (mounted) {
          // Map snake_case to camelCase
          const mapped = data.map(p => ({
            slug: p.slug,
            number: p.number,
            status: p.status,
            kind: p.kind,
            name: p.name,
            description: p.description,
            cover: p.cover,
            gallery: p.gallery || [],
            photoNote: p.photo_note,
            ...(p.partners ? { partners: p.partners } : {}),
          }));
          setProjects(mapped);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchProjects();
    
    return () => { mounted = false; };
  }, []);

  return { projects, loading, error };
}
