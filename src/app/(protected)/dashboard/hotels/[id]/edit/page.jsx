"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import FacilitiesField from "@/components/facilities/FacilitiesField"

import { getHotelById, updateHotel } from "@/lib/services/hotel"
import { getProvinces, getCities, getDistricts, getSubDistricts, getFacilities } from "@/lib/services/reference"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const schema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
    address: z.string().min(1).max(255),
    phone_number: z.string().min(10).max(13),
    email: z.string().email(),
    province_id: z.number(),
    city_id: z.number(),
    district_id: z.number(),
    sub_district_id: z.number(),
    facilities: z.array(z.string()).nonempty(),
    images: z.any().optional()
})

export default function UpdateHotelPage() {
    const router = useRouter()
    const params = useParams()

    const [provinces, setProvinces] = useState([])
    const [cities, setCities] = useState([])
    const [districts, setDistricts] = useState([])
    const [subDistricts, setSubDistricts] = useState([])
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
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            address: "",
            phone_number: "",
            email: "",
            province_id: undefined,
            city_id: undefined,
            district_id: undefined,
            sub_district_id: undefined,
            facilities: [],
            images: []
        }
    })

    const provinceId = watch("province_id")
    const cityId = watch("city_id")
    const districtId = watch("district_id")

    // fetch reference
    useEffect(() => {
        getProvinces().then(setProvinces)
        getFacilities().then(setFacilities)
    }, [])

    useEffect(() => {
        if (provinceId) getCities(provinceId).then(setCities)
    }, [provinceId])

    useEffect(() => {
        if (cityId) getDistricts(cityId).then(setDistricts)
    }, [cityId])

    useEffect(() => {
        if (districtId) getSubDistricts(districtId).then(setSubDistricts)
    }, [districtId])

    // fetch hotel detail
    useEffect(() => {
        const fetchData = async () => {
            try {
                const hotel = await getHotelById(params.id)

                reset({
                    ...hotel,
                    facilities: hotel.facilities.map((f) => String(f.id)),
                    images: [] // kosongkan, supaya upload baru tidak bentrok
                })

                setExistingImages(hotel.images || []) // simpan images lama
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
                } else if (key === "facilities") {
                    values.facilities.forEach((f) => formData.append("facilities[]", f))
                } else if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key])
                }
            })

            // kirim daftar gambar yang dihapus
            removedImages.forEach((id) => formData.append("remove_images[]", id))

            await updateHotel(params.id, formData)
            toast.success("Hotel updated successfully", {
                description: "The hotel details have been updated."
            })
            router.push("/dashboard/hotels")
        } catch (err) {
            console.error("❌ Failed to update hotel:", err)
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold">Edit Hotel</h1>

                    {/* Hotel Name */}
                    <div>
                        <Label>Hotel Name</Label>
                        <Input
                            placeholder="Hotel Name"
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

                    {/* Address */}
                    <div>
                        <Label>Address</Label>
                        <Textarea
                            placeholder="Address"
                            {...register("address")}
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <Label>Phone Number</Label>
                        <Input
                            placeholder="Phone Number"
                            {...register("phone_number")}
                        />
                        {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <Input
                            placeholder="Email"
                            {...register("email")}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Location Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Province */}
                        <div>
                            <Label>Province</Label>
                            <Controller
                                control={control}
                                name="province_id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Province" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.province_id && <p className="text-sm text-red-500">{errors.province_id.message}</p>}
                        </div>

                        {/* City */}
                        <div>
                            <Label>City</Label>
                            <Controller
                                control={control}
                                name="city_id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : ""}
                                        disabled={!provinceId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.city_id && <p className="text-sm text-red-500">{errors.city_id.message}</p>}
                        </div>

                        {/* District */}
                        <div>
                            <Label>District</Label>
                            <Controller
                                control={control}
                                name="district_id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : ""}
                                        disabled={!cityId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d) => (
                                                <SelectItem key={d.id} value={String(d.id)}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.district_id && <p className="text-sm text-red-500">{errors.district_id.message}</p>}
                        </div>

                        {/* Sub District */}
                        <div>
                            <Label>Sub District</Label>
                            <Controller
                                control={control}
                                name="sub_district_id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? String(field.value) : ""}
                                        disabled={!districtId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sub District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subDistricts.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.sub_district_id && <p className="text-sm text-red-500">{errors.sub_district_id.message}</p>}
                        </div>
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

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
