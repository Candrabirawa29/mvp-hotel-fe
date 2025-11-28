// app/dashboard/room-types/create/page.jsx
"use client"
import { useState, useEffect } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Service untuk reference data
import { getHotels, getRoomTypeFacilities, getBedTypes } from "@/lib/services/reference" // Asumsi fungsi ini ada
import { createRoomType } from "@/lib/services/roomType"
import FacilitiesField from "@/components/facilities/FacilitiesField" // Asumsi ini bisa digunakan untuk room type facilities juga, atau buat yang baru jika beda
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash } from "lucide-react"

// --- Validasi Zod ---
const schema = z.object({
  hotel_id: z.number({ required_error: "Hotel is required" }),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  capacity: z.number().min(1, "Capacity min 1"),
  facilities: z.array(z.string()).nonempty("At least 1 facility required"),
  images: z.any().refine((files) => files?.length > 0, "At least 1 image required"),
  beds: z.array(z.object({
    bed_type_id: z.number({ required_error: "Bed type required" }),
    quantity: z.number().min(1, "Quantity min 1")
  })).min(1, "At least 1 bed required"),
  prices: z.array(z.object({
    weekday_price: z.number({ required_error: "Weekday price required" }),
    weekend_price: z.number({ required_error: "Weekend price required" }),
    currency: z.string().min(1, "Currency required"),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.string().min(1, "End date required"),
  })).min(1, "At least 1 price required"),
})

export default function CreateRoomTypePage() {
  const router = useRouter()
  const [hotels, setHotels] = useState([])
  const [bedTypes, setBedTypes] = useState([])
  const [facilities, setFacilities] = useState([])

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({
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

  // Load reference data
  useEffect(() => {
    Promise.all([
      getHotels(),
      getBedTypes(),
      getRoomTypeFacilities()
    ]).then(([hotelsData, bedTypesData, facilitiesData]) => {
      setHotels(hotelsData)
      setBedTypes(bedTypesData)
      setFacilities(facilitiesData)
    })
  }, [])

  const onSubmit = async (values) => {
  try {
    const formData = new FormData()

    // Semua field biasa
    Object.keys(values).forEach((key) => {
      if (key === "images") {
        for (let file of values.images) {
          formData.append("images[]", file)
        }
      } 
      else if (key === "facilities") {
        // KHUSUS facilities → append sebagai facilities[]
        values.facilities.forEach(f => {
          formData.append("facilities[]", f)  // f adalah string (bisa ID atau nama)
        })
      }
      else if (key === "beds" || key === "prices") {
        // beds & prices tetap pake format nested
        values[key].forEach((item, index) => {
          Object.keys(item).forEach(subKey => {
            formData.append(`${key}[${index}][${subKey}]`, item[subKey])
          })
        })
      }
      else {
        formData.append(key, values[key])
      }
    })

    await createRoomType(formData)

    toast.success("Room created successfully", {
      description: "The new room type has been added to the list."
    })

    router.push("/dashboard/room-types")
    // success
  } catch (err) {
    console.error("Failed to create room type:", err)
    toast.error("Failed to create room-type", {
        description: err?.message || "An unexpected error occurred."
      })
  }
}

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Tambah Tipe Kamar</h1>

          {/* Hotel */}
          <div>
            <Label>Hotel</Label>
            <Controller
              control={control}
              name="hotel_id"
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
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

        {/* Images */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Images</h2>
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
                    <Select onValueChange={(val) => field.onChange(Number(val))}>
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
                  placeholder="e.g. IDR"
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
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  )
}