"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui";
import { createRoom } from "@/lib/services/room";
import { getRoomTypes } from "@/lib/services/roomType";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";

// Schema validation yang diperbaiki
const baseSchema = z.object({
  room_type_id: z.string().min(1, "Pilih tipe kamar"),
  creation_type: z.enum(["single", "bulk", "auto"]),
  status: z.enum(["available", "occupied", "maintenance"]),
  is_active: z.boolean().default(true),
});

const singleSchema = baseSchema.extend({
  creation_type: z.literal("single"),
  room_number: z.string().min(1, "Nomor kamar wajib diisi").max(50, "Maksimal 50 karakter"),
  floor: z.string().max(50, "Maksimal 50 karakter").optional().or(z.literal('')),
});

const bulkSchema = baseSchema.extend({
  creation_type: z.literal("bulk"),
  rooms: z.array(z.object({
    room_number: z.string().min(1, "Nomor kamar wajib diisi").max(50, "Maksimal 50 karakter"),
    floor: z.string().max(50).optional().or(z.literal('')),
    status: z.enum(["available", "occupied", "maintenance"]),
    is_active: z.boolean().default(true),
  })).min(1, "Minimal 1 kamar").max(100, "Maksimal 100 kamar"),
});

const autoSchema = baseSchema.extend({
  creation_type: z.literal("auto"),
  auto_generate: z.object({
    start_floor: z.number().min(1, "Lantai awal minimal 1"),
    end_floor: z.number().min(1, "Lantai akhir minimal 1"),
    rooms_per_floor: z.number().min(1, "Minimal 1 kamar per lantai").max(50, "Maksimal 50 kamar per lantai"),
    room_number_prefix: z.string().max(10, "Awalan maksimal 10 karakter").optional().or(z.literal('')),
    starting_room_number: z.number().min(1, "Nomor awal minimal 1").max(99, "Nomor awal maksimal 99"),
  }),
});

const schema = z.discriminatedUnion('creation_type', [
  singleSchema,
  bulkSchema,
  autoSchema,
]);

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue, 
    control,
    trigger,
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { 
      creation_type: "single",
      room_type_id: "",
      status: "available", 
      is_active: true,
      room_number: "",
      floor: "",
      rooms: [{ room_number: "", floor: "", status: "available", is_active: true }],
      auto_generate: {
        start_floor: 1,
        end_floor: 2,
        rooms_per_floor: 10,
        room_number_prefix: "",
        starting_room_number: 1,
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms"
  });

  const creationType = watch("creation_type");
  const watchedValues = watch();

  useEffect(() => {
    console.log("🔵 BASE URL:", process.env.NEXT_PUBLIC_API_URL);
  import("@/lib/api").then(({ default: api }) => {
    console.log("🔵 AXIOS BASE URL:", api.defaults.baseURL);
  });
    const loadRoomTypes = async () => {
      try {
        setIsLoading(true);
        const res = await getRoomTypes(1, {}, 1000);
        console.log("Room Types Response:", res);
        
        // Handle different response structures
        if (Array.isArray(res)) {
          setRoomTypes(res);
        } else if (res?.data) {
          setRoomTypes(res.data);
        } else if (res?.roomTypes) {
          setRoomTypes(res.roomTypes);
        } else {
          setRoomTypes([]);
        }
      } catch (error) {
        console.error("Error loading room types:", error);
        toast.error("Gagal memuat tipe kamar");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoomTypes();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    console.group("🔵 [CREATE ROOM DEBUG]");
    console.log("📌 Raw form data:", data);

    try {
      // 🧹 Cleanup payload sesuai dengan backend Laravel
      const submitData = {
        room_type_id: parseInt(data.room_type_id),
        creation_type: data.creation_type,
        status: data.status,
        is_active: data.is_active ?? true,
      };

      if (data.creation_type === "single") {
        submitData.room_number = data.room_number.trim();
        submitData.floor = data.floor?.trim() || null;
      } else if (data.creation_type === "bulk") {
        submitData.rooms = data.rooms.map(room => ({
          room_number: room.room_number.trim(),
          floor: room.floor?.trim() || null,
          status: room.status || 'available',
          is_active: room.is_active ?? true,
        }));
      } else if (data.creation_type === "auto") {
        submitData.auto_generate = { ...data.auto_generate };
      }

      console.log("📤 Final payload sent to API:", submitData);

      try {
        // ✅ FIX: Tambahkan hotelId sebagai parameter pertama
        // TODO: Ganti dengan cara ambil hotelId dari context/localStorage
        const hotelId = typeof window !== 'undefined' ? localStorage.getItem('hotel_id') || 1 : 1;
        
        console.log("🏨 Hotel ID:", hotelId);
        
        const result = await createRoom(hotelId, submitData);
        console.log("✅ API SUCCESS:", result);
        
        toast.success(`Berhasil membuat ${getCreatedCount(data)} kamar`);
        router.push("/dashboard/rooms");
      } catch (apiErr) {
        console.error("❌ API Request Error:", apiErr);
        
        if (apiErr.response) {
          console.error("💥 Backend responded with error:");
          console.log("Status:", apiErr.response.status);
          console.log("Data:", apiErr.response.data);
          
          // Handle Laravel validation errors
          if (apiErr.response.status === 422) {
            const errors = apiErr.response.data?.errors;
            if (errors) {
              // Display first error
              const firstError = Object.values(errors)[0]?.[0];
              toast.error(`Validasi gagal: ${firstError || "Data tidak valid"}`);
            } else {
              toast.error(apiErr.response.data?.message || "Validasi gagal");
            }
          } else if (apiErr.response.status === 404) {
            toast.error("Endpoint tidak ditemukan. Pastikan hotel_id sudah benar.");
          } else if (apiErr.response.status === 403) {
            toast.error("Anda tidak memiliki akses ke hotel ini.");
          } else if (apiErr.response.status === 500) {
            toast.error("Server error. Silakan coba lagi nanti.");
          } else {
            toast.error(apiErr.response.data?.message || "Terjadi kesalahan");
          }
        } else if (apiErr.request) {
          toast.error("Tidak ada response dari server");
        } else {
          toast.error(apiErr.message || "Gagal membuat kamar");
        }
      }

    } catch (error) {
      console.error("🔥 FINAL SUBMIT ERROR:", error);
      toast.error(error.message || "Gagal membuat kamar");
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  const getCreatedCount = (data) => {
    if (data.creation_type === "single") return 1;
    if (data.creation_type === "bulk") return data.rooms?.length || 0;
    if (data.creation_type === "auto") {
      const config = data.auto_generate;
      return (config.end_floor - config.start_floor + 1) * config.rooms_per_floor;
    }
    return 0;
  };

  const addBulkRoom = () => {
    append({ room_number: "", floor: "", status: "available", is_active: true });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await trigger();
    
    if (isValid) {
      handleSubmit(onSubmit)(e);
    } else {
      console.log("Form errors:", errors);
      toast.error("Harap perbaiki error pada form sebelum submit");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Memuat tipe kamar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tambah Kamar</h1>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Room Type Selection */}
        <div>
          <Label htmlFor="room_type_id" className="block mb-2">
            Tipe Kamar <span className="text-red-500">*</span>
          </Label>
          <Select 
            onValueChange={(v) => setValue("room_type_id", v, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.room_type_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Pilih tipe kamar" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.length > 0 ? (
                roomTypes.map(rt => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>
                    {rt.name} - {rt.hotel?.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>Tidak ada tipe kamar tersedia</SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.room_type_id && (
            <p className="text-red-500 text-sm mt-1">{errors.room_type_id.message}</p>
          )}
        </div>

        {/* Creation Type Selection */}
        <div>
          <Label htmlFor="creation_type" className="block mb-2">
            Jenis Pembuatan <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={creationType} 
            onValueChange={(v) => {
              setValue("creation_type", v, { shouldValidate: true });
              // Reset fields when changing creation type
              if (v === "single") {
                setValue("rooms", [{ room_number: "", floor: "", status: "available", is_active: true }]);
                setValue("auto_generate", {
                  start_floor: 1,
                  end_floor: 2,
                  rooms_per_floor: 10,
                  room_number_prefix: "",
                  starting_room_number: 1,
                });
              } else if (v === "bulk") {
                setValue("room_number", "");
                setValue("floor", "");
                setValue("auto_generate", {
                  start_floor: 1,
                  end_floor: 2,
                  rooms_per_floor: 10,
                  room_number_prefix: "",
                  starting_room_number: 1,
                });
              } else if (v === "auto") {
                setValue("room_number", "");
                setValue("floor", "");
                setValue("rooms", [{ room_number: "", floor: "", status: "available", is_active: true }]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="bulk">Bulk Create</SelectItem>
              <SelectItem value="auto">Auto Generate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Single Room Form */}
        {creationType === "single" && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Single Room</h3>
            
            <div>
              <Label htmlFor="room_number">Nomor Kamar <span className="text-red-500">*</span></Label>
              <Input 
                {...register("room_number")}
                placeholder="101, A201, dll"
                className={errors.room_number ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.room_number && (
                <p className="text-red-500 text-sm mt-1">{errors.room_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="floor">Lantai</Label>
              <Input 
                {...register("floor")}
                placeholder="1, 2, 3..."
                className={errors.floor ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.floor && (
                <p className="text-red-500 text-sm mt-1">{errors.floor.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Bulk Create Form */}
        {creationType === "bulk" && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Bulk Create - {fields.length} Kamar</h3>
              <Button 
                type="button" 
                onClick={addBulkRoom} 
                variant="outline" 
                size="sm"
                disabled={fields.length >= 100}
              >
                + Tambah Kamar
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded bg-gray-50">
                <div className="col-span-4">
                  <Label>Nomor Kamar <span className="text-red-500">*</span></Label>
                  <Input 
                    {...register(`rooms.${index}.room_number`)}
                    placeholder={`Kamar ${index + 1}`}
                    className={errors.rooms?.[index]?.room_number ? "border-red-500" : ""}
                  />
                  {errors.rooms?.[index]?.room_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.rooms[index].room_number.message}</p>
                  )}
                </div>
                <div className="col-span-4">
                  <Label>Lantai</Label>
                  <Input 
                    {...register(`rooms.${index}.floor`)}
                    placeholder="Lantai"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Status</Label>
                  <Select 
                    defaultValue="available"
                    onValueChange={(v) => setValue(`rooms.${index}.status`, v, { shouldValidate: true })}
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
                <div className="col-span-1">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
            {errors.rooms && !Array.isArray(errors.rooms) && (
              <p className="text-red-500 text-sm mt-1">{errors.rooms.message}</p>
            )}
          </div>
        )}

        {/* Auto Generate Form */}
        {creationType === "auto" && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">
              Auto Generate - {getCreatedCount(watchedValues)} Kamar
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lantai Awal <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  {...register("auto_generate.start_floor", { valueAsNumber: true })}
                  min="1"
                />
                {errors.auto_generate?.start_floor && (
                  <p className="text-red-500 text-sm mt-1">{errors.auto_generate.start_floor.message}</p>
                )}
              </div>
              <div>
                <Label>Lantai Akhir <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  {...register("auto_generate.end_floor", { valueAsNumber: true })}
                  min="1"
                />
                {errors.auto_generate?.end_floor && (
                  <p className="text-red-500 text-sm mt-1">{errors.auto_generate.end_floor.message}</p>
                )}
              </div>
              <div>
                <Label>Kamar per Lantai <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  {...register("auto_generate.rooms_per_floor", { valueAsNumber: true })}
                  min="1"
                  max="50"
                />
                {errors.auto_generate?.rooms_per_floor && (
                  <p className="text-red-500 text-sm mt-1">{errors.auto_generate.rooms_per_floor.message}</p>
                )}
              </div>
              <div>
                <Label>Nomor Awal Kamar <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  {...register("auto_generate.starting_room_number", { valueAsNumber: true })}
                  min="1"
                  max="99"
                />
                {errors.auto_generate?.starting_room_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.auto_generate.starting_room_number.message}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label>Awalan Nomor Kamar (Opsional)</Label>
                <Input 
                  {...register("auto_generate.room_number_prefix")}
                  placeholder="A, B, VIP, dll"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-800">
                <strong>Contoh pola:</strong> {watchedValues.auto_generate?.room_number_prefix || "A"}
                {watchedValues.auto_generate?.start_floor || "1"}
                {String(watchedValues.auto_generate?.starting_room_number || "1").padStart(2, '0')}
                , {watchedValues.auto_generate?.room_number_prefix || "A"}
                {watchedValues.auto_generate?.start_floor || "1"}
                {String((watchedValues.auto_generate?.starting_room_number || 1) + 1).padStart(2, '0')}
                , ...
              </p>
            </div>
          </div>
        )}

        {/* Common Fields */}
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
          <div>
            <Label>Status</Label>
            <Select 
              defaultValue="available" 
              onValueChange={(v) => setValue("status", v, { shouldValidate: true })}
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

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              defaultChecked
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="text-sm">
              Kamar Aktif
            </Label>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-800 font-semibold">
            Akan membuat <span className="text-lg">{getCreatedCount(watchedValues)}</span> kamar
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/rooms")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 min-w-32"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </span>
            ) : (
              `Buat ${getCreatedCount(watchedValues)} Kamar`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}