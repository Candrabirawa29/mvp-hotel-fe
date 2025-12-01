"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { deleteRoom } from "@/lib/services/room";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  available: "bg-green-500",
  occupied: "bg-red-500",
  maintenance: "bg-yellow-500",
};

const RoomActions = ({ room, refreshData }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRoom(room.id);
      toast.success("Kamar berhasil dihapus");
      refreshData();
    } catch {
      toast.error("Gagal menghapus kamar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <Link href={`/dashboard/rooms/${room.id}`}>
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Detail</DropdownMenuItem>
          </Link>
          <Link href={`/dashboard/rooms/${room.id}/edit`}>
            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          </Link>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />Hapus
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kamar {room.room_number}?</AlertDialogTitle>
          <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const columns = [
  {
    accessorKey: "room_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor Kamar" />,
  },
  {
    accessorKey: "roomType.name",
    header: "Tipe Kamar",
    cell: ({ row }) => row.original.room_type?.name || "-",
  },
  {
    accessorKey: "roomType.hotel.name",
    header: "Hotel",
    cell: ({ row }) => row.original.room_type?.hotel?.name || "-",
  },
  {
    accessorKey: "floor",
    header: "Lantai",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={`${statusColors[status]} text-white`}>
          {status === "available" ? "Tersedia" : status === "occupied" ? "Ditempati" : "Maintenance"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Aktif",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Ya" : "Tidak"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <RoomActions room={row.original} refreshData={table.options.meta?.refreshData} />,
  },
];