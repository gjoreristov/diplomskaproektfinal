"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device, User } from "@/types";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getDeviceById } from "@/lib/devices";
import { ArrowLeft, Edit, Trash2, Clock, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { getAllDevices } from "@/lib/devices";

export async function generateStaticParams() {
  const devices = getAllDevices();
  return devices.map((device) => ({
    id: device.id,
  }));
}

export default function DeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (params.id) {
      const foundDevice = getDeviceById(params.id as string);
      setDevice(foundDevice || null);
    }
    
    setIsLoading(false);
  }, [params.id]);

  const canEdit = () => {
    if (!user || !device) return false;
    return isAdmin(user) || device.createdBy === user.email;
  };

  const handleEdit = () => {
    router.push(`/devices/edit/${device?.id}`);
  };

  const handleDelete = () => {
    // For now, we'll just go back to the devices list
    // In a real app, this would show a confirmation dialog
    router.push("/devices");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[400px]">
          <p>Loading device details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!device) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col items-center justify-center h-[400px]">
            <h2 className="text-2xl font-bold">Device Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The device you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/devices")} className="mt-4">
              View All Devices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {canEdit() && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg font-medium">{device.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Room</h3>
                  <p className="text-lg font-medium">{device.room}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{device.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Network Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">IP Address</p>
                      <p>{device.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">MAC Address</p>
                      <p>{device.macAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Created By</h3>
                  <p>{device.createdBy}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <p>{format(new Date(device.createdAt), "PPP")}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p>{format(new Date(device.updatedAt), "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}