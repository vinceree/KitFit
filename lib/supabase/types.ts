export type ScenePreset = "alpine" | "coastal" | "forest" | "urban";
export type PlanTier = "starter" | "growth" | "pro";
export type ProductCategory =
  | "jersey"
  | "bib_shorts"
  | "jacket"
  | "vest"
  | "baselayer"
  | "longsleeve"
  | "accessories"
  | "other";

export interface Brand {
  id: string;
  name: string;
  email: string;
  stripe_customer_id: string | null;
  plan_tier: PlanTier;
  created_at: string;
}

export interface ApiKey {
  id: string;
  brand_id: string;
  key: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  image_url: string;
  product_url: string | null;
  category: ProductCategory | null;
  created_at: string;
}

export interface ProductPairing {
  id: string;
  brand_id: string;
  product_id: string;
  complement_id: string;
  is_default: boolean;
  created_at: string;
}

export interface ProductReferenceImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
  created_at: string;
}

export type TryOnStatus = "processing" | "completed" | "failed";

export interface TryOn {
  id: string;
  brand_id: string;
  product_id: string | null;
  scene_preset: ScenePreset;
  result_image_url: string | null;
  job_id: string | null;
  status: TryOnStatus;
  error_message: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: Brand;
        Insert: Omit<Brand, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Brand, "id">>;
        Relationships: [];
      };
      api_keys: {
        Row: ApiKey;
        Insert: Omit<ApiKey, "id" | "created_at" | "is_active"> & {
          id?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<ApiKey, "id">>;
        Relationships: [
          {
            foreignKeyName: "api_keys_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Product, "id">>;
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          }
        ];
      };
      try_ons: {
        Row: TryOn;
        Insert: Omit<TryOn, "id" | "created_at" | "status" | "job_id" | "error_message"> & {
          id?: string;
          created_at?: string;
          job_id?: string | null;
          status?: TryOnStatus;
          error_message?: string | null;
        };
        Update: Partial<Omit<TryOn, "id">>;
        Relationships: [
          {
            foreignKeyName: "try_ons_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "try_ons_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
