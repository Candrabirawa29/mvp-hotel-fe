// app/components/room-types/RoomTypeFilters.jsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import {
  getHotels as getAllHotels,
  getRoomTypeFacilities
} from "@/lib/services/reference"  // Asumsi fungsi ini ada di reference untuk mendapatkan list simple hotels dan facilities khusus room types

export function RoomTypeFilters({ filters, onFiltersChange }) {
  const [hotels, setHotels] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getAllHotels(),
      getRoomTypeFacilities()
    ]).then(([hotelsData, facilitiesData]) => {
      setHotels(hotelsData)
      setFacilities(facilitiesData)
    })
  }, [])

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleFacilityToggle = (facilityId) => {
    const currentFacilities = filters.facilities || []
    const newFacilities = currentFacilities.includes(facilityId)
      ? currentFacilities.filter(id => id !== facilityId)
      : [...currentFacilities, facilityId]
    onFiltersChange({ ...filters, facilities: newFacilities })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      hotel_id: null,
      facilities: [],
      sort: null
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== "" && value !== null
    if (key === 'facilities') return Array.isArray(value) && value.length > 0
    return value !== null && value !== undefined
  }).length

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotel Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Hotel</label>
          <Select
            value={filters.hotel_id?.toString() || "all"}
            onValueChange={(value) => handleFilterChange('hotel_id', value === "all" ? null : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Hotel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort By</label>
          <Select
            value={filters.sort || "default"}
            onValueChange={(value) => handleFilterChange('sort', value === "default" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Default Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="name,asc">Name A-Z</SelectItem>
              <SelectItem value="name,desc">Name Z-A</SelectItem>
              <SelectItem value="created_at,desc">Newest First</SelectItem>
              <SelectItem value="created_at,asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Facilities Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {facilities.map((facility) => (
            <Badge
              key={facility.id}
              variant={filters.facilities?.includes(facility.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-600"
              onClick={() => handleFacilityToggle(facility.id)}
            >
              {facility.name}
              {filters.facilities?.includes(facility.id) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}