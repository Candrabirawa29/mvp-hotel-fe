"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getRoomById, updateRoom } from "@/lib/services/room";
import { getRoomTypes } from "@/lib/services/roomType";
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  room_type_id: z.string().min(1, "Tipe kamar wajib dipilih"),
  room_number: z.string()
    .min(1, "Nomor kamar wajib diisi")
    .max(50, "Nomor kamar maksimal 50 karakter"),
  floor: z.string()
    .max(50, "Lantai maksimal 50 karakter")
    .optional()
    .or(z.literal('')),
  status: z.enum(["available", "occupied", "maintenance"], {
    errorMap: () => ({ message: "Status tidak valid" })
  }),
  is_active: z.boolean().default(true),
});

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    formState: { errors, isSubmitting, isValid } 
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      room_type_id: "",
      room_number: "",
      floor: "",
      status: "available",
      is_active: true,
    }
  });

  // Watch values for debugging
  const formValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room types
        const typesResponse = await getRoomTypes(1, {}, 1000);
        const roomTypesData = Array.isArray(typesResponse) ? typesResponse : 
                             typesResponse?.data || typesResponse?.roomTypes || [];
        setRoomTypes(roomTypesData);

        // Fetch room data
        console.log("Fetching room with ID:", id);
        const roomData = await getRoomById(id);
        console.log("Room data received:", roomData);

        // Handle different response structures
        let roomDetails;
        if (roomData?.data) {
          roomDetails = roomData.data; // Laravel dengan wrapper data
        } else if (roomData) {
          roomDetails = roomData; // Direct response
        } else {
          throw new Error("Data kamar tidak ditemukan");
        }

        setRoom(roomDetails);

        // Set form values
        setValue("room_type_id", roomDetails.room_type_id?.toString() || "");
        setValue("room_number", roomDetails.room_number || "");
        setValue("floor", roomDetails.floor || "");
        setValue("status", roomDetails.status || "available");
        setValue("is_active", Boolean(roomDetails.is_active));

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        toast.error("Gagal memuat data kamar");
        router.push("/dashboard/rooms");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log("Submitting form data:", data);

      // Clean data
      const submitData = {
        ...data,
        room_type_id: parseInt(data.room_type_id),
        is_active: Boolean(data.is_active),
        floor: data.floor?.trim() || null
      };

      console.log("Cleaned data for API:", submitData);
      
      await updateRoom(id, submitData);
      
      toast.success("Kamar berhasil diperbarui");
      router.push(`/dashboard/rooms/${id}`);
      
    } catch (err) {
      console.error("Update error:", err);
      
      if (err.response?.status === 422) {
        // Laravel validation errors
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0]?.[0];
          toast.error(`Validasi gagal: ${firstError || "Data tidak valid"}`);
        } else {
          toast.error(err.response.data?.message || "Validasi gagal");
        }
      } else if (err.response?.status === 404) {
        toast.error("Kamar tidak ditemukan");
      } else {
        toast.error(err.message || "Gagal update kamar");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-10 w-64" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
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
      <div className="container mx-auto p-6 max-w-2xl">
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

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Kamar</h1>
            <p className="text-muted-foreground">
              Edit informasi kamar {room.room_number}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kamar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="room_type_id">
                Tipe Kamar <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formValues.room_type_id} 
                onValueChange={(value) => setValue("room_type_id", value, { shouldValidate: true })}
              >
                <SelectTrigger className={errors.room_type_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih tipe kamar" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.length > 0 ? (
                    roomTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id.toString()}>
                        {rt.name} - {rt.hotel?.name || "Hotel tidak diketahui"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Tidak ada tipe kamar tersedia</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.room_type_id && (
                <p className="text-red-500 text-sm">{errors.room_type_id.message}</p>
              )}
            </div>

            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="room_number">
                Nomor Kamar <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="room_number"
                {...register("room_number")}
                placeholder="101, A201, dll"
                className={errors.room_number ? "border-red-500" : ""}
                maxLength={50}
                onChange={(e) => {
                  setValue("room_number", e.target.value, { shouldValidate: true });
                }}
              />
              {errors.room_number && (
                <p className="text-red-500 text-sm">{errors.room_number.message}</p>
              )}
            </div>

            {/* Floor */}
            <div className="space-y-2">
              <Label htmlFor="floor">Lantai</Label>
              <Input 
                id="floor"
                {...register("floor")}
                placeholder="1, 2, 3..."
                className={errors.floor ? "border-red-500" : ""}
                maxLength={50}
                onChange={(e) => {
                  setValue("floor", e.target.value, { shouldValidate: true });
                }}
              />
              {errors.floor && (
                <p className="text-red-500 text-sm">{errors.floor.message}</p>
              )}
              <p className="text-xs text-gray-500">Kosongkan jika tidak ada lantai spesifik</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formValues.status} 
                onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="occupied">Ditempati</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                defaultChecked
                className="rounded border-gray-300 h-5 w-5"
                onChange={(e) => {
                  setValue("is_active", e.target.checked, { shouldValidate: true });
                }}
              />
              <Label htmlFor="is_active" className="text-base cursor-pointer">
                Kamar Aktif
              </Label>
              <p className="text-sm text-gray-500 ml-4">
                {formValues.is_active ? 
                  "Kamar akan ditampilkan dan dapat dipesan" : 
                  "Kamar tidak akan ditampilkan dan tidak dapat dipesan"}
              </p>
            </div>

            {/* Debug Info (Optional) */}
            <div className="bg-gray-50 p-4 rounded text-sm">
              <p className="font-medium mb-2">Debug Info:</p>
              <p>Form valid: {isValid ? "Yes" : "No"}</p>
              <p>Room ID: {room.id}</p>
              <p>Current room type ID: {room.room_type_id}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </span>
                ) : "Simpan Perubahan"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/dashboard/rooms/${id}`)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}