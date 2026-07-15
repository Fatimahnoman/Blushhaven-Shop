import { motion } from "framer-motion";
import { ShoppingBag, PackageX, Star, Tag, Layers, Beaker } from "lucide-react";
import { ProductCard, type Product } from "@/components/ProductCard";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { useCallback } from "react";

type ProductRow = Product & {
  category_id?: string | null;
  benefits?: string | null;
  ingredients?: string | null;
  description?: string | null;
};

type ComparisonField = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const FIELDS: ComparisonField[] = [
  { key: "price", label: "Price", icon: <Tag className="w-3.5 h-3.5" /> },
  { key: "brand", label: "Brand", icon: <Layers className="w-3.5 h-3.5" /> },
  { key: "rating", label: "Rating", icon: <Star className="w-3.5 h-3.5" /> },
  { key: "stock", label: "Stock", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { key: "benefits", label: "Key Benefits", icon: <Beaker className="w-3.5 h-3.5" /> },
  { key: "ingredients", label: "Ingredients", icon: <Beaker className="w-3.5 h-3.5" /> },
  { key: "category", label: "Category", icon: <Layers className="w-3.5 h-3.5" /> },
];

function getValue(product: ProductRow, key: string): string {
  switch (key) {
    case "price":
      return `$${Number(product.price).toFixed(2)}`;
    case "brand":
      return product.brand ?? "—";
    case "rating":
      return `${Number(product.rating).toFixed(1)} (${product.review_count} reviews)`;
    case "stock":
      if (product.stock === 0) return "Out of stock";
      if (product.stock <= 5) return `Only ${product.stock} left`;
      return "In stock";
    case "benefits":
      return product.benefits ?? "—";
    case "ingredients":
      if (!product.ingredients) return "—";
      return product.ingredients
        .split(",")
        .slice(0, 3)
        .map((i) => i.trim())
        .join(", ") + (product.ingredients.split(",").length > 3 ? "..." : "");
    case "category":
      return product.category_id ?? "—";
    default:
      return "—";
  }
}

function StockIndicator({ product }: { product: ProductRow }) {
  if (product.stock === 0) {
    return <span className="text-red-500 font-medium text-xs">Out of stock</span>;
  }
  if (product.stock <= 5) {
    return <span className="text-amber-500 font-medium text-xs">Only {product.stock} left</span>;
  }
  return <span className="text-green-600 font-medium text-xs">In stock</span>;
}

export function CompareProducts({ products }: { products: Product[] }) {
  const add = useCart((s) => s.add);

  const handleAddToCart = useCallback(
    (product: Product) => {
      add({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        image_key: product.image_url ?? "lipstick",
      });
      toast.success(`${product.name} added to bag`);
    },
    [add]
  );

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-2xl p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/40 grid place-items-center mx-auto mb-5">
          <PackageX className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <h3 className="font-display text-xl mb-2">No products to compare</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Add products to your comparison list to see them side by side.
        </p>
      </motion.div>
    );
  }

  const rows = (products as ProductRow[]).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Product headers with thumbnails */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="w-[160px] p-4 text-left" />
              {rows.map((product, i) => (
                <motion.th
                  key={product.id}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-blush-soft shadow-soft">
                      <img
                        src={productImage(product.image_url, (product as any).category_slug)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="section-label text-[9px]">{product.brand}</p>
                      <p className="font-display text-sm mt-1 leading-tight line-clamp-2">{product.name}</p>
                    </div>
                  </div>
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((field, fieldIndex) => (
              <motion.tr
                key={field.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + fieldIndex * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={fieldIndex % 2 === 0 ? "bg-muted/15" : ""}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {field.icon}
                    <span className="text-xs font-medium uppercase tracking-wider">{field.label}</span>
                  </div>
                </td>
                {rows.map((product) => {
                  const rp = product as ProductRow;
                  return (
                    <td key={product.id} className="p-4 text-center">
                      {field.key === "stock" ? (
                        <StockIndicator product={rp} />
                      ) : (
                        <span className="text-sm">{getValue(rp, field.key)}</span>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}

            {/* Add to Cart row */}
            <motion.tr
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <td className="p-4" />
              {rows.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-primary text-xs uppercase tracking-[0.15em] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add to Cart
                  </motion.button>
                </td>
              ))}
            </motion.tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
