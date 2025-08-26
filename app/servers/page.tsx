"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { ServerIcon, HardDrive, Cpu, MemoryStick } from "lucide-react";

export default function ServersPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your server infrastructure.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
              <ServerIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Active servers
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45%</div>
              <p className="text-xs text-muted-foreground">
                Average across all servers
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                Average memory utilization
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Server List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ServerIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">SERVER001</p>
                  <p className="text-xs text-muted-foreground">192.168.1.1 - Server Room A</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Online</p>
                  <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ServerIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">SERVER002</p>
                  <p className="text-xs text-muted-foreground">192.168.1.2 - Server Room A</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Online</p>
                  <p className="text-xs text-muted-foreground">Uptime: 98.7%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <ServerIcon className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">SERVER003</p>
                  <p className="text-xs text-muted-foreground">192.168.1.3 - Server Room B</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">Maintenance</p>
                  <p className="text-xs text-muted-foreground">Scheduled downtime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}