// app/dashboard/room-types/[id]/edit/page.jsx
"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FacilitiesField from "@/components/facilities/FacilitiesField"
import { getRoomTypeById, updateRoomType } from "@/lib/services/roomType"
import { getAllHotels, getRoomTypeFacilities, getBedTypes } from "@/lib/services/reference"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash } from "lucide-react"

const schema = z.object({
  hotel_id: z.number().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  capacity: z.number().min(1),
  facilities: z.array(z.string()).min(1),
  images: z.any().optional(),
  beds: z.array(z.object({
    bed_type_id: z.number(),
    quantity: z.number().min(1)
  })).min(1),
  prices: z.array(z.object({
    weekday_price: z.number(),
    weekend_price: z.number(),
    currency: z.string().min(1),
    start_date: z.string().min(1),
    end_date: z.string().min(1),
  })).min(1),
})

export default function UpdateRoomTypePage() {
  const router = useRouter()
  const params = useParams()
  const [hotels, setHotels] = useState([])
  const [bedTypes, setBedTypes] = useState([])
  const [facilities, setFacilities] = useState([])

  // images lama & yg dihapus
  const [existingImages, setExistingImages] = useState([])
  const [removedImages, setRemovedImages] = useState([])

  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hotel_id: undefined,
      name: "",
      description: "",
      capacity: 1,
      facilities: [],
      images: [],
      beds: [],
      prices: [],
    }
  })

  const { fields: bedFields, append: appendBed, remove: removeBed } = useFieldArray({ control, name: "beds" })
  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({ control, name: "prices" })

  // fetch reference
  useEffect(() => {
    Promise.all([
      getAllHotels(),
      getBedTypes(),
      getRoomTypeFacilities()
    ]).then(([hotelsData, bedTypesData, facilitiesData]) => {
      setHotels(hotelsData)
      setBedTypes(bedTypesData)
      setFacilities(facilitiesData)
    })
  }, [])

  // fetch room type detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomType = await getRoomTypeById(params.id)

        reset({
          ...roomType,
          facilities: roomType.facilities.map((f) => String(f.id)),
          beds: roomType.beds.map((b) => ({ bed_type_id: b.bed_type_id, quantity: b.quantity })),
          prices: roomType.prices.map((p) => ({
            weekday_price: p.weekday_price,
            weekend_price: p.weekend_price,
            currency: p.currency,
            start_date: p.start_date,
            end_date: p.end_date,
          })),
          images: [] // kosongkan, supaya upload baru tidak bentrok
        })

        setExistingImages(roomType.images || []) // simpan images lama
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, reset])

  // remove image handler
  const handleRemoveImage = (img) => {
    setRemovedImages((prev) => [...prev, img.id]) // simpan id yang dihapus
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id)) // update UI
  }

  const onSubmit = async (values) => {
    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')

      Object.keys(values).forEach((key) => {
        if (key === "images" && values.images.length > 0) {
          for (let file of values.images) {
            formData.append("images[]", file)
          }
        } else if (key === "facilities" || key === "beds" || key === "prices") {
          values[key].forEach((item, index) => {
            Object.keys(item).forEach(subKey => {
              formData.append(`${key}[${index}][${subKey}]`, item[subKey])
            })
          })
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })

      // kirim daftar gambar yang dihapus
      removedImages.forEach((id) => formData.append("remove_images[]", id))

      await updateRoomType(params.id, formData)
      toast.success("Room type updated successfully", {
        description: "The room type details have been updated."
      })
      router.push("/dashboard/room-types")
    } catch (err) {
      console.error("❌ Failed to update room type:", err)
      toast.error("Failed to update room type", {
        description: err?.message || "An unexpected error occurred."
      })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Edit Tipe Kamar</h1>

          {/* Hotel */}
          <div>
            <Label>Hotel</Label>
            <Controller
              control={control}
              name="hotel_id"
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.hotel_id && <p className="text-sm text-red-500">{errors.hotel_id.message}</p>}
          </div>

          {/* Name */}
          <div>
            <Label>Name</Label>
            <Input
              placeholder="Name"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Description"
              {...register("description")}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Capacity */}
          <div>
            <Label>Capacity</Label>
            <Input
              type="number"
              placeholder="Capacity"
              {...register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
          </div>
        </div>

        {/* Facilities */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Facilities</h2>
          <Controller
            control={control}
            name="facilities"
            render={({ field }) => (
              <FacilitiesField
                facilities={facilities}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.facilities && <p className="text-sm text-red-500">{errors.facilities.message}</p>}
        </div>

        {/* Existing Images */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Existing Images</h2>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/storage/${img.image_url}`}
                  alt={img.filename}
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {existingImages.length === 0 && (
              <p className="text-gray-500 text-sm">No images</p>
            )}
          </div>
        </div>

        {/* New Images */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Add New Images</h2>
          <Input type="file" multiple accept="image/*" {...register("images")} />
          {errors.images && <p className="text-sm text-red-500">{errors.images.message}</p>}
        </div>

        {/* Beds */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Beds</h2>
          {bedFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Bed Type</Label>
                <Controller
                  control={control}
                  name={`beds.${index}.bed_type_id`}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bed Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bedTypes?.map((bt) => (
                          <SelectItem key={bt.id} value={String(bt.id)}>{bt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.beds?.[index]?.bed_type_id && <p className="text-sm text-red-500">{errors.beds[index].bed_type_id.message}</p>}
              </div>
              <div className="flex-1">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  {...register(`beds.${index}.quantity`, { valueAsNumber: true })}
                />
                {errors.beds?.[index]?.quantity && <p className="text-sm text-red-500">{errors.beds[index].quantity.message}</p>}
              </div>
              <Button type="button" variant="destructive" onClick={() => removeBed(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendBed({ bed_type_id: undefined, quantity: 1 })}>
            <Plus className="mr-2 h-4 w-4" /> Add Bed
          </Button>
          {errors.beds && <p className="text-sm text-red-500">{errors.beds.message}</p>}
        </div>

        {/* Prices */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Prices</h2>
          {priceFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label>Weekday Price</Label>
                <Input
                  type="number"
                  {...register(`prices.${index}.weekday_price`, { valueAsNumber: true })}
                />
                {errors.prices?.[index]?.weekday_price && <p className="text-sm text-red-500">{errors.prices[index].weekday_price.message}</p>}
              </div>
              <div>
                <Label>Weekend Price</Label>
                <Input
                  type="number"
                  {...register(`prices.${index}.weekend_price`, { valueAsNumber: true })}
                />
                {errors.prices?.[index]?.weekend_price && <p className="text-sm text-red-500">{errors.prices[index].weekend_price.message}</p>}
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  {...register(`prices.${index}.currency`)}
                />
                {errors.prices?.[index]?.currency && <p className="text-sm text-red-500">{errors.prices[index].currency.message}</p>}
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  {...register(`prices.${index}.start_date`)}
                />
                {errors.prices?.[index]?.start_date && <p className="text-sm text-red-500">{errors.prices[index].start_date.message}</p>}
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  {...register(`prices.${index}.end_date`)}
                />
                {errors.prices?.[index]?.end_date && <p className="text-sm text-red-500">{errors.prices[index].end_date.message}</p>}
              </div>
              <Button type="button" variant="destructive" onClick={() => removePrice(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendPrice({ weekday_price: 0, weekend_price: 0, currency: "IDR", start_date: "", end_date: "" })}>
            <Plus className="mr-2 h-4 w-4" /> Add Price
          </Button>
          {errors.prices && <p className="text-sm text-red-500">{errors.prices.message}</p>}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  )
}