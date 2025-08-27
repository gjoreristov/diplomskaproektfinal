"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { ServerIcon, HardDrive, Cpu, MemoryStick, Network, Activity, Zap } from "lucide-react";

interface ServerData {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  uptime: number;
  temperature: number;
  powerConsumption: number;
}

const initialServers: ServerData[] = [
  {
    id: "1",
    name: "SERVER001",
    ipAddress: "192.168.1.1",
    location: "Server Room A",
    status: 'online',
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    networkIn: 125,
    networkOut: 89,
    uptime: 99.9,
    temperature: 42,
    powerConsumption: 350
  },
  {
    id: "2",
    name: "SERVER002",
    ipAddress: "192.168.1.2",
    location: "Server Room A",
    status: 'online',
    cpuUsage: 23,
    memoryUsage: 54,
    diskUsage: 67,
    networkIn: 78,
    networkOut: 156,
    uptime: 98.7,
    temperature: 38,
    powerConsumption: 280
  },
  {
    id: "3",
    name: "SERVER003",
    ipAddress: "192.168.1.3",
    location: "Server Room B",
    status: 'maintenance',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 45,
    networkIn: 0,
    networkOut: 0,
    uptime: 0,
    temperature: 25,
    powerConsumption: 50
  },
  {
    id: "4",
    name: "DATABASE-01",
    ipAddress: "192.168.1.10",
    location: "Server Room A",
    status: 'online',
    cpuUsage: 78,
    memoryUsage: 85,
    diskUsage: 89,
    networkIn: 234,
    networkOut: 198,
    uptime: 99.5,
    temperature: 48,
    powerConsumption: 420
  }
];

export default function ServersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [servers, setServers] = useState<ServerData[]>(initialServers);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Function to generate realistic fluctuations
  const generateFluctuation = (baseValue: number, maxChange: number = 5): number => {
    const change = (Math.random() - 0.5) * 2 * maxChange;
    const newValue = baseValue + change;
    return Math.max(0, Math.min(100, newValue));
  };

  const generateNetworkFluctuation = (baseValue: number): number => {
    const change = (Math.random() - 0.5) * 2 * 20;
    return Math.max(0, baseValue + change);
  };

  const generateTemperatureFluctuation = (baseValue: number): number => {
    const change = (Math.random() - 0.5) * 2 * 3;
    return Math.max(20, Math.min(60, baseValue + change));
  };

  const generatePowerFluctuation = (baseValue: number): number => {
    const change = (Math.random() - 0.5) * 2 * 30;
    return Math.max(50, baseValue + change);
  };

  const updateServerStatus = (server: ServerData): ServerData => {
    if (server.status === 'maintenance') {
      return server; // Don't update maintenance servers
    }

    // Occasionally change status
    let newStatus = server.status;
    if (Math.random() < 0.02) { // 2% chance to change status
      const statuses: ('online' | 'warning')[] = ['online', 'warning'];
      newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    }

    // High CPU or memory usage should trigger warning status
    const newCpuUsage = generateFluctuation(server.cpuUsage, 8);
    const newMemoryUsage = generateFluctuation(server.memoryUsage, 6);
    
    if (newCpuUsage > 85 || newMemoryUsage > 90) {
      newStatus = 'warning';
    } else if (newCpuUsage < 70 && newMemoryUsage < 80 && newStatus === 'warning') {
      newStatus = 'online';
    }

    return {
      ...server,
      status: newStatus,
      cpuUsage: newCpuUsage,
      memoryUsage: newMemoryUsage,
      diskUsage: generateFluctuation(server.diskUsage, 2),
      networkIn: generateNetworkFluctuation(server.networkIn),
      networkOut: generateNetworkFluctuation(server.networkOut),
      temperature: generateTemperatureFluctuation(server.temperature),
      powerConsumption: generatePowerFluctuation(server.powerConsumption),
      uptime: server.uptime + (Math.random() - 0.5) * 0.1
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prevServers => 
        prevServers.map(server => updateServerStatus(server))
      );
      setLastUpdate(new Date());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'maintenance': return 'outline';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getProgressColor = (value: number) => {
    if (value > 85) return 'bg-red-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Calculate aggregate stats
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const avgCpuUsage = servers.filter(s => s.status === 'online').reduce((sum, s) => sum + s.cpuUsage, 0) / onlineServers || 0;
  const avgMemoryUsage = servers.filter(s => s.status === 'online').reduce((sum, s) => sum + s.memoryUsage, 0) / onlineServers || 0;
  const totalPowerConsumption = servers.reduce((sum, s) => sum + s.powerConsumption, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
            <p className="text-muted-foreground mt-2">
              Real-time server monitoring and infrastructure management.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Online Servers</CardTitle>
              <ServerIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineServers}/{servers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active servers
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avg CPU Usage</CardTitle>
              <Cpu className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCpuUsage.toFixed(1)}%</div>
              <Progress value={avgCpuUsage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avg Memory</CardTitle>
              <MemoryStick className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMemoryUsage.toFixed(1)}%</div>
              <Progress value={avgMemoryUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Power</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPowerConsumption.toFixed(0)}W</div>
              <p className="text-xs text-muted-foreground">
                Power consumption
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {servers.map((server) => (
            <Card key={server.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`} />
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(server.status)}>
                    {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {server.ipAddress} • {server.location}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Cpu className="w-4 h-4 mr-1" />
                        CPU
                      </div>
                      <span>{server.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={server.cpuUsage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <MemoryStick className="w-4 h-4 mr-1" />
                        Memory
                      </div>
                      <span>{server.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={server.memoryUsage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-1" />
                        Disk
                      </div>
                      <span>{server.diskUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={server.diskUsage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        Temp
                      </div>
                      <span>{server.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={(server.temperature / 60) * 100} className="h-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Network className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-xs text-muted-foreground">Network</div>
                    <div className="font-medium">
                      ↓{server.networkIn.toFixed(0)} ↑{server.networkOut.toFixed(0)} MB/s
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-xs text-muted-foreground">Power</div>
                    <div className="font-medium">{server.powerConsumption.toFixed(0)}W</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                    <div className="font-medium">{server.uptime.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}