// app/dashboard/room-types/page.jsx
"use client"
import { columns } from "./columns"
import { getRoomTypes } from "@/lib/services/roomType"
import { DataTable } from "@/components/common/data-table"
import { RoomTypeFilters } from "@/components/room-types/RoomTypeFilters"
import { useTableFilters } from "@/hooks/useTableFilters"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function RoomTypesTable() {
  const initialFilters = {
    search: "",
    hotel_id: null,
    facilities: [],
    sort: null
  }
  const initialPagination = {
    pageIndex: 0,
    pageSize: 10,
  }
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
  } = useTableFilters(getRoomTypes, initialFilters, initialPagination)

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading room types: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Room Types</h2>
          <p className="text-muted-foreground">Kelola tipe kamar hotel Anda</p>
        </div>
        <Link href="/dashboard/room-types/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tipe Kamar
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
            filters
          }}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersReplace} 
          meta={{ refreshData }}
          searchConfig={{
            enabled: true, 
            placeholder: "Cari tipe kamar...",
            debounceMs: 500
          }}
          showColumnToggle={true}
          emptyStateMessage="Tidak ada tipe kamar yang ditemukan dengan filter saat ini."
          className="min-h-[400px]"
          filterComponent={<RoomTypeFilters />}
          isLoading={loading}
        />
      </div>
    </div>
  )
}