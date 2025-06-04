"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device, User } from "@/types";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAllDevices } from "@/lib/devices";
import { LaptopIcon, ServerIcon, NetworkIcon } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Get all devices
    const allDevices = getAllDevices();
    setDevices(allDevices);
  }, []);

  // Simple analytics
  const totalDevices = devices.length;
  const recentDevices = devices.filter(
    (device) => new Date(device.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;
  const myDevices = user ? devices.filter((device) => device.createdBy === user.email).length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}! Here's an overview of your network devices.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <LaptopIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDevices}</div>
              <p className="text-xs text-muted-foreground">
                Devices in the network
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
              <ServerIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentDevices}</div>
              <p className="text-xs text-muted-foreground">
                Devices added in the last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">My Devices</CardTitle>
              <NetworkIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myDevices}</div>
              <p className="text-xs text-muted-foreground">
                Devices you've added
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.slice(0, 5).map((device) => (
                  <div key={device.id} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <LaptopIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.ipAddress} - {device.room}
                      </p>
                    </div>
                  </div>
                ))}
                
                {devices.length === 0 && (
                  <p className="text-sm text-muted-foreground">No devices found</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm">{user?.role || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{user?.email || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Permissions</p>
                    <p className="text-sm">
                      {user && isAdmin(user) ? "Full Access" : "Limited Access"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Quick Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use the Devices page to add and manage network devices</li>
                    <li>• The OpenAI assistant will help validate your entries</li>
                    <li>• Admin users have full access to all features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}