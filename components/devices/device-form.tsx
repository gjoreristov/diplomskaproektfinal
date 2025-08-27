"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceFormData, ValidationResult } from "@/types";
import { validateDeviceData, getSuggestions } from "@/lib/openai";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DeviceFormProps {
  onSubmit: (data: DeviceFormData) => void;
  initialData?: DeviceFormData;
  isEditing?: boolean;
}

const defaultFormData: DeviceFormData = {
  name: "",
  ipAddress: "",
  macAddress: "",
  room: "",
  description: "",
};

export function DeviceForm({ onSubmit, initialData, isEditing = false }: DeviceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DeviceFormData>(initialData || defaultFormData);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [suggestionOpen, setSuggestionOpen] = useState<Record<string, boolean>>({
    name: false,
    room: false,
    description: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    // Generate description suggestions when IP or MAC address changes
    if (formData.ipAddress && formData.macAddress) {
      handleGetDescriptionSuggestions();
    }
  }, [formData.ipAddress, formData.macAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Skip validation for IP and MAC if editing and value hasn't changed
    if (isEditing && initialData && (name === "ipAddress" || name === "macAddress")) {
      if (value === initialData[name as keyof DeviceFormData]) {
        return;
      }
    }
    
    // Validate the field
    validateField(name, value);
    
    // Get suggestions for selected fields
    if (["name", "room"].includes(name)) {
      handleGetSuggestions(name, value);
    }
  };

  const validateField = async (field: string, value: string) => {
    if (["name", "ipAddress", "macAddress"].includes(field)) {
      const result = await validateDeviceData(
        field, 
        value,
        isEditing ? initialData?.ipAddress : undefined
      );
      setValidationResults((prev) => ({ ...prev, [field]: result }));
    }
  };

  const handleGetSuggestions = async (field: string, value: string) => {
    if (value.length >= 2) {
      const fieldSuggestions = await getSuggestions(field, value);
      setSuggestions((prev) => ({ ...prev, [field]: fieldSuggestions }));
    } else {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleGetDescriptionSuggestions = async () => {
    setIsGeneratingDescription(true);
    const descriptionSuggestions = await getSuggestions("description", "", {
      ipAddress: formData.ipAddress,
      macAddress: formData.macAddress,
    });
    setSuggestions((prev) => ({ ...prev, description: descriptionSuggestions }));
    setSuggestionOpen((prev) => ({ ...prev, description: true }));
    setIsGeneratingDescription(false);
  };

  const handleSelectSuggestion = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuggestionOpen((prev) => ({ ...prev, [field]: false }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate all required fields
    const requiredFields = ["name", "ipAddress", "macAddress"];
    let isValid = true;
    
    await Promise.all(
      requiredFields.map(async (field) => {
        // Skip validation for IP and MAC if editing and value hasn't changed
        if (isEditing && initialData && (field === "ipAddress" || field === "macAddress")) {
          if (formData[field as keyof DeviceFormData] === initialData[field as keyof DeviceFormData]) {
            return;
          }
        }
        
        const result = await validateDeviceData(
          field, 
          formData[field as keyof DeviceFormData] as string,
          isEditing ? initialData?.ipAddress : undefined
        );
        setValidationResults((prev) => ({ ...prev, [field]: result }));
        if (!result.isValid) {
          isValid = false;
        }
      })
    );
    
    if (isValid) {
      onSubmit(formData);
    }
    
    setIsSubmitting(false);
  };

  const getFieldStatus = (field: string) => {
    const result = validationResults[field];
    if (!result) return null;
    
    if (result.isValid) {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          <span className="text-xs">{result.message}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-destructive">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">{result.message}</span>
        </div>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Device" : "Add New Device"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Computer Name</Label>
              <div>
                <Popover 
                  open={suggestionOpen.name && suggestions.name?.length > 0} 
                  onOpenChange={(open) => setSuggestionOpen(prev => ({ ...prev, name: open }))}
                >
                  <PopoverTrigger asChild>
                    <div>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., SERVER001"
                        className="w-full"
                        onFocus={() => setSuggestionOpen(prev => ({ ...prev, name: true }))}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" side="bottom">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {suggestions.name?.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              onSelect={() => handleSelectSuggestion("name", suggestion)}
                            >
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {getFieldStatus("name")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="e.g., 192.168.1.1"
                disabled={isEditing && initialData?.ipAddress === formData.ipAddress}
              />
              {getFieldStatus("ipAddress")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                name="macAddress"
                value={formData.macAddress}
                onChange={handleChange}
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                disabled={isEditing && initialData?.macAddress === formData.macAddress}
              />
              {getFieldStatus("macAddress")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room Location</Label>
              <Popover
                open={suggestionOpen.room && suggestions.room?.length > 0}
                onOpenChange={(open) => setSuggestionOpen(prev => ({ ...prev, room: open }))}
              >
                <PopoverTrigger asChild>
                  <div>
                    <Input
                      id="room"
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      placeholder="e.g., Server Room A"
                      onFocus={() => setSuggestionOpen(prev => ({ ...prev, room: true }))}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" side="bottom">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {suggestions.room?.map((suggestion) => (
                          <CommandItem
                            key={suggestion}
                            onSelect={() => handleSelectSuggestion("room", suggestion)}
                          >
                            {suggestion}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiDescription">AI-Generated Technical Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAIDescription}
                disabled={!formData.name || !formData.ipAddress || !formData.macAddress || !formData.room || isGeneratingAI}
                className="h-8"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                {isGeneratingAI ? 'Generating...' : 'Generate AI Description'}
              </Button>
            </div>
            <Textarea
              id="aiDescription"
              name="aiDescription"
              value={formData.aiDescription || ''}
              onChange={handleChange}
              placeholder="Click 'Generate AI Description' to create a technical description using ChatGPT"
              rows={4}
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              This field uses OpenAI's ChatGPT to generate comprehensive technical descriptions based on your device information.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetDescriptionSuggestions}
                disabled={!formData.ipAddress || !formData.macAddress || isGeneratingDescription}
                className="h-8"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                Generate Suggestions
              </Button>
            </div>
            <Popover
              open={suggestionOpen.description && suggestions.description?.length > 0}
              onOpenChange={(open) => setSuggestionOpen(prev => ({ ...prev, description: open }))}
            >
              <PopoverTrigger asChild>
                <div>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter device description"
                    rows={3}
                    onFocus={() => setSuggestionOpen(prev => ({ ...prev, description: true }))}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" side="bottom">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {suggestions.description?.map((suggestion) => (
                        <CommandItem
                          key={suggestion}
                          onSelect={() => handleSelectSuggestion("description", suggestion)}
                        >
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Device" : "Add Device"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}