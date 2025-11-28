// app/dashboard/room-types/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoomTypeById } from "@/lib/services/roomType";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RoomTypeDetailPage() {
  const { id } = useParams();
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchRoomType = async () => {
      try {
        const data = await getRoomTypeById(id);
        setRoomType(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load room type");
      } finally {
        setLoading(false);
      }
    };
    fetchRoomType();
  }, [id]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedImage(null);
    }, 300);
  };

  if (loading) return <RoomTypeDetailSkeleton />;
  if (error) return (
    <Alert variant="destructive" className="max-w-4xl mx-auto">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const displayedImages = showAllImages
    ? roomType.images
    : roomType.images?.slice(0, 6);
  const remainingImages = roomType.images?.length - 6;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{roomType.name}</h1>
          <p className="text-muted-foreground mt-2">Capacity: {roomType.capacity}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Hotel: {roomType.hotel?.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          {roomType.images?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>
                  {roomType.images.length} photos available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {displayedImages.map((img) => (
                    <div 
                      key={img.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleImageClick(img)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_URL}/storage/${img.image_url}`}
                        alt={roomType.name}
                        className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                    </div>
                  ))}
                </div>
                
                {roomType.images.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllImages(!showAllImages)}
                    >
                      {showAllImages ? 'Show Less' : `Show ${remainingImages} More Photos`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{roomType.description || "No description available."}</p>
            </CardContent>
          </Card>

          {/* Beds */}
          {roomType.beds?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Beds</CardTitle>
                <CardDescription>
                  {roomType.beds.length} bed configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roomType.beds.map((bed) => (
                    <div key={bed.id} className="flex justify-between">
                      <span>{bed.bedType.name}</span>
                      <span>x {bed.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prices */}
          {roomType.prices?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prices</CardTitle>
                <CardDescription>
                  {roomType.prices.length} price periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Weekday</TableHead>
                      <TableHead>Weekend</TableHead>
                      <TableHead>Currency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomType.prices.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>{price.start_date}</TableCell>
                        <TableCell>{price.end_date}</TableCell>
                        <TableCell>{price.weekday_price}</TableCell>
                        <TableCell>{price.weekend_price}</TableCell>
                        <TableCell>{price.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Facilities */}
          {roomType.facilities?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
                <CardDescription>
                  {roomType.facilities.length} facilities available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roomType.facilities.map((f) => (
                    <Badge key={f.id} variant="outline">
                      {f.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTitle>
        </DialogTitle>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-none">
          <div className="relative flex items-center justify-center">
            {selectedImage && (
              <div className="relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/storage/${selectedImage.image_url}`}
                  alt={roomType.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={handleCloseDialog}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton Loading Component
function RoomTypeDetailSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-40 mx-auto mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}