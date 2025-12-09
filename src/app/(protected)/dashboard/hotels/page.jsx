"use client";

import { columns } from "./columns";
import { getHotels } from "@/lib/services/hotel";
import { DataTable } from "@/components/common/data-table";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { useTableFilters } from "@/hooks/useTableFilters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export default function HotelsTable() {
  const initialFilters = {
    search: "",
    province_id: null,
    city_id: null,
    district_id: null,
    sub_district_id: null,
    facilities: [],
    sort: null,
  };

  const initialPagination = {
    pageIndex: 0,
    pageSize: 10,
  };

  const {
    data,
    loading,
    error,
    pagination,
    pageMeta,
    filters,
    handleFiltersChange,
    handleFiltersReplace,
    handlePaginationChange,
    refreshData,
    resetFilters,
  } = useTableFilters(getHotels, initialFilters, initialPagination);

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading hotels: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      const o = await getHotels();
      console.log("Data Hotel:", o);
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hotels</h2>
          <p className="text-muted-foreground">Kelola properti hotel Anda</p>
        </div>
        <Link href="/dashboard/hotels/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Hotel
          </Button>
        </Link>
      </div>

      {/* Table Section dengan loading indicator */}
      <div className="relative">
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageMeta.last_page}
          state={{
            pagination,
            filters,
          }}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersReplace}
          meta={{ refreshData }}
          searchConfig={{
            enabled: true,
            placeholder: "Cari hotel...",
            debounceMs: 500,
          }}
          showColumnToggle={true}
          emptyStateMessage="Tidak ada hotel yang ditemukan dengan filter saat ini."
          className="min-h-[400px]"
          filterComponent={<HotelFilters />}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
