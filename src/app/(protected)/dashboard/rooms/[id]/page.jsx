"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRoomById } from "@/lib/services/room";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const statusBadge = {
  available: "bg-green-500 text-white",
  occupied: "bg-red-500 text-white",
  maintenance: "bg-yellow-500 text-white",
};

export default function RoomDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching room with ID:", id);
        
        const data = await getRoomById(id);
        console.log("Room data received:", data);
        
        // Handle different response structures
        if (data?.data) {
          // Laravel dengan wrapper data
          setRoom(data.data);
        } else if (data) {
          // Direct response
          setRoom(data);
        } else {
          throw new Error("Data kamar tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching room:", err);
        setError(err.message);
        toast.error("Gagal memuat detail kamar");
        router.push("/dashboard/rooms");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-10 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/dashboard/rooms")}>
              Kembali ke Daftar Kamar
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Kamar Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Kamar dengan ID {id} tidak ditemukan.</p>
          <Button onClick={() => router.push("/dashboard/rooms")}>
            Kembali ke Daftar Kamar
          </Button>
        </div>
      </div>
    );
  }

  // Handle nested data structure
  const roomType = room.roomType || room.room_type;
  const hotel = roomType?.hotel || room.hotel || roomType?.hotel;
  
  const statusText = {
    available: "Tersedia",
    occupied: "Ditempati", 
    maintenance: "Maintenance"
  }[room.status] || room.status;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Kamar {room.room_number}</h1>
            <p className="text-muted-foreground">
              {roomType?.name || "Tipe tidak tersedia"} • {hotel?.name || "Hotel tidak tersedia"}
            </p>
          </div>
        </div>

        <Link href={`/dashboard/rooms/${room.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Kamar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Kamar */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kamar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nomor Kamar</p>
              <p className="text-2xl font-semibold">{room.room_number}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Lantai</p>
              <p className="text-lg">{room.floor || "-"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <Badge className={`${statusBadge[room.status] || "bg-gray-500"} px-3 py-1`}>
                  {statusText}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Aktif</p>
              <Badge variant={room.is_active ? "default" : "secondary"}>
                {room.is_active ? "Ya" : "Tidak"}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Dibuat</p>
              <p className="text-lg">
                {room.created_at ? new Date(room.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tipe Kamar */}
        <Card>
          <CardHeader>
            <CardTitle>Tipe Kamar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Tipe</p>
              <p className="text-lg font-medium">{roomType?.name || "-"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Hotel</p>
              <p className="text-lg">{hotel?.name || "-"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Kapasitas</p>
              <p className="text-lg">
                {roomType?.max_adults || 0} Dewasa • {roomType?.max_children || 0} Anak
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Harga Standar</p>
              <p className="text-lg font-semibold">
                {roomType?.standard_price ? `Rp ${roomType.standard_price.toLocaleString('id-ID')}` : "-"}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Fasilitas</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {roomType?.facilities?.length > 0 ? (
                  roomType.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility.name || facility}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">Tidak ada fasilitas</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservation History (Optional) */}
      {room.reservations && room.reservations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Riwayat Reservasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {room.reservations.slice(0, 5).map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Reservation #{reservation.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    reservation.reservation_status === 'confirmed' ? 'default' :
                    reservation.reservation_status === 'cancelled' ? 'destructive' :
                    'outline'
                  }>
                    {reservation.reservation_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}