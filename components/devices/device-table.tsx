"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Device, User } from "@/types";
import { isAdmin } from "@/lib/auth";
import { 
  Pencil, 
  Trash2, 
  Search, 
  Laptop, 
  ServerIcon, 
  Plus,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeviceForm } from "@/components/devices/device-form";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceTableProps {
  devices: Device[];
  currentUser: User | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
}

type SortField = 'name' | 'ipAddress' | 'macAddress' | 'room' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function DeviceTable({ devices, currentUser, onDelete, onUpdate }: DeviceTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  
  const canEdit = (device: Device) => {
    if (!currentUser) return false;
    return isAdmin(currentUser) ;
    //|| device.createdBy === currentUser.email
  };
  
  const handleDelete = (id: string) => {
    onDelete(id);
    setIsDeleteDialogOpen(false);
  };
  
  const handleUpdate = (data: any) => {
    if (selectedDevice) {
      onUpdate(selectedDevice.id, data);
      setIsEditDialogOpen(false);
    }
  };
  
  const openDeleteDialog = (device: Device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };
  
  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setIsEditDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };
  
  // Get unique rooms for filter
  const uniqueRooms = Array.from(new Set(devices.map(device => device.room)));

  const filteredAndSortedDevices = devices
    // Apply room filter
    .filter(device => filterRoom === 'all' || device.room === filterRoom)
    // Apply search filter
    .filter((device) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        device.name.toLowerCase().includes(searchLower) ||
        device.ipAddress.toLowerCase().includes(searchLower) ||
        device.macAddress.toLowerCase().includes(searchLower) ||
        device.room.toLowerCase().includes(searchLower) ||
        device.description.toLowerCase().includes(searchLower)
      );
    })
    // Apply sorting
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
        case 'ipAddress':
        case 'macAddress':
        case 'room':
          comparison = a[sortField].localeCompare(b[sortField]);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getDeviceIcon = (name: string) => {
    if (name.toLowerCase().includes('server')) {
      return <ServerIcon className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search devices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {uniqueRooms.map(room => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push("/devices/add")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                <div className="flex items-center">
                  Name {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('ipAddress')} className="cursor-pointer">
                <div className="flex items-center">
                  IP Address {getSortIcon('ipAddress')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('macAddress')} className="cursor-pointer">
                <div className="flex items-center">
                  MAC Address {getSortIcon('macAddress')}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('room')} className="hidden md:table-cell cursor-pointer">
                <div className="flex items-center">
                  Room {getSortIcon('room')}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="hidden xl:table-cell">AI Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No devices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {getDeviceIcon(device.name)}
                      <span className="ml-2">{device.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{device.ipAddress}</TableCell>
                  <TableCell>{device.macAddress}</TableCell>
                  <TableCell className="hidden md:table-cell">{device.room}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[300px] truncate">
                    {device.description}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[300px] truncate">
                    {device.aiDescription || 'Not generated'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/devices/${device.id}`)}
                          className="cursor-pointer"
                        >
                        </DropdownMenuItem>
                        {canEdit(device) && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(device)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(device)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDevice?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDevice && handleDelete(selectedDevice.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <DeviceForm
              initialData={{
                name: selectedDevice.name,
                ipAddress: selectedDevice.ipAddress,
                macAddress: selectedDevice.macAddress,
                room: selectedDevice.room,
                description: selectedDevice.description,
              }}
              onSubmit={handleUpdate}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}