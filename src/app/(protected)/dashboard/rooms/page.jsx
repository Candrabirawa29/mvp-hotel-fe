"use client"
import { columns } from "./columns"
import { getRooms } from "@/lib/services/room"
import { DataTable } from "@/components/common/data-table"
import { RoomFilters } from "@/components/rooms/RoomFilters"
import { useTableFilters } from "@/hooks/useTableFilters"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function RoomsPage() {
  const initialFilters = {
    search: "",
    room_type_id: null,
    hotel_id: null,
    status: null,
  }

  const { data, loading, error, pageMeta, filters, handleFiltersReplace, refreshData } = useTableFilters(
    getRooms,
    initialFilters,
    { pageIndex: 0, pageSize: 10 }
  )

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Rooms</h2>
          <p className="text-muted-foreground">Kelola nomor kamar hotel</p>
        </div>
        <Link href="/dashboard/rooms/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kamar
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pageCount={pageMeta.last_page}
        state={{ filters }}
        onFiltersChange={handleFiltersReplace}
        meta={{ refreshData }}
        searchConfig={{ placeholder: "Cari nomor kamar..." }}
        filterComponent={<RoomFilters />}
        isLoading={loading}
        emptyStateMessage="Belum ada kamar"
      />
    </div>
  )
}