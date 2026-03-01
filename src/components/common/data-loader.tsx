import { type ReactNode } from "react";
import { DataLoader as SkeletonLoader } from "@/components/ui/data-loader";
import { ErrorState } from "./error-state";
import { EmptyState } from "./empty-state";
import { Loader2 } from "lucide-react";

/** Props shape untuk SkeletonLoader */
type SkeletonVariant = "card" | "table" | "stat-cards" | "tags" | "list";

interface DataLoaderProps {
  /** Apakah data sedang diload fetch / initial load */
  isLoading: boolean;
  /** Pass state error dari SWR / fetcher */
  error?: unknown;
  /** Triggered saat tombol "Coba Lagi" ditekan pada ErrorState */
  onRetry?: () => void;
  /** Kondisi manual apakah data kosong, biasanya dicek length === 0 */
  isEmpty?: boolean;
  /** Tampilan kustom yang dirender saat data kosong */
  emptyFallback?: ReactNode;
  
  /** Varian loading skeleton. Jika "spinner", tampilkan spinner kecil. Default "card". */
  skeletonVariant?: SkeletonVariant | "spinner";
  /** Props tambahan untuk skeleton (misal rows={5} count={4}) */
  skeletonProps?: Partial<React.ComponentProps<typeof SkeletonLoader>>;
  
  /** Pesan kustom untuk default EmptyState */
  emptyTitle?: string;
  /** Deskripsi kustom untuk default EmptyState */
  emptyDescription?: string;
  /** Icon kustom untuk default EmptyState */
  emptyIcon?: ReactNode;

  /** Children hanya akan dirender jika tidak loading, tidak error, dan tidak empty. Opsional karena legacy code menggunakan conditional (ternary). */
  children?: ReactNode;
}

/**
 * Global DataLoader Wrapper (DBStudio Base)
 *
 * Komponen pembungkus untuk menangani state standard dari data fetching (SWR):
 * 1. Loading -> merender Skeleton UI atau Spinner
 * 2. Error -> merender ErrorState dengan tombol retry
 * 3. Empty -> merender EmptyState (atau fallback kustom)
 * 4. Success -> merender children
 *
 * @example
 * <DataLoader
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 *   isEmpty={data.length === 0}
 *   skeletonVariant="table"
 * >
 *   <AppTable data={data} columns={columns} />
 * </DataLoader>
 */
export function DataLoader({
  isLoading,
  error,
  onRetry,
  isEmpty = false,
  emptyFallback,
  skeletonVariant = "card",
  skeletonProps,
  emptyTitle = "Data Kosong",
  emptyDescription = "Belum ada data untuk ditampilkan saat ini.",
  emptyIcon,
  children,
}: DataLoaderProps) {
  if (error) {
    return (
      <ErrorState
        title="Gagal Memuat Data"
        description={error instanceof Error ? error.message : typeof error === 'string' ? error : "Terjadi kesalahan yang tidak diketahui"}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    if (skeletonVariant === "spinner") {
      return (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return <SkeletonLoader variant={skeletonVariant} {...skeletonProps} />;
  }

  if (isEmpty) {
    if (emptyFallback) {
      return <>{emptyFallback}</>;
    }
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  if (children) return <>{children}</>;
  return null;
}
