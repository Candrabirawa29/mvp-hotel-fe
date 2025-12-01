"use client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge, Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { getHotels } from "@/lib/services/reference";
import { getRoomTypesSimple } from "@/lib/services/roomType"; // buat versi simple kalau perlu

export function RoomFilters({ filters, onFiltersChange }) {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    getHotels().then(setHotels);
  }, []);

  const handleChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? null : value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filter Kamar</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => onFiltersChange({})}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={filters.hotel_id?.toString() || "all"} onValueChange={(v) => handleChange("hotel_id", v)}>
          <SelectTrigger><SelectValue placeholder="Hotel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Hotel</SelectItem>
            {hotels.map(h => <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.status || "all"} onValueChange={(v) => handleChange("status", v)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="available">Tersedia</SelectItem>
            <SelectItem value="occupied">Ditempati</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}