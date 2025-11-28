"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Service untuk create bed type
import { createBedType } from "@/lib/services/bed-types"

// --- Validasi Zod ---
const schema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
})

export default function CreateBedTypePage() {
    const router = useRouter()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
        }
    })

    const onSubmit = async (values) => {
        try {
            await createBedType(values)
            router.push("/dashboard/bed-types")
        } catch (err) {
            console.error("❌ Failed to create bed type:", err)
        }
    }

    return (
        <>
            <div className="container mx-auto p-6 max-w-4xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold">Tambah Tipe Tempat Tidur</h1>

                        {/* Name */}
                        <div>
                            <Label>Nama</Label>
                            <Input
                                placeholder="Nama Tipe Tempat Tidur"
                                {...register("name")}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label>Deskripsi</Label>
                            <Textarea
                                placeholder="Deskripsi Tipe Tempat Tidur"
                                {...register("description")}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    )
}