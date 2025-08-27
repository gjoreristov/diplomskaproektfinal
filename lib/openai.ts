import { ValidationResult } from "@/types";
import { getAllDevices } from "./devices";

// This would be your OpenAI API key in a real application
// For security, this should be stored in environment variables
// const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Mock OpenAI validation function for demo purposes
// In a real application, this would make API calls to OpenAI
export const validateDeviceData = async (
  field: string,
  value: string,
  deviceId?: string
): Promise<ValidationResult> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const devices = getAllDevices();

  // Basic validation rules
  switch (field) {
    case "name":
      if (!value.trim()) {
        return {
          isValid: false,
          message: "Computer name cannot be empty",
        };
      }
      return {
        isValid: true,
        message: "Valid computer name",
      };

    case "ipAddress":
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      if (!ipRegex.test(value)) {
        return {
          isValid: false,
          message: "Invalid IP address format",
          suggestions: ["192.168.1.1", "10.0.0.1"],
        };
      }

      // Check for uniqueness
      const existingIpDevice = devices.find(
        device => device.ipAddress === value && device.id !== deviceId
      );
      
      if (existingIpDevice) {
        return {
          isValid: false,
          message: "This IP address is already in use",
        };
      }

      return {
        isValid: true,
        message: "Valid and unique IP address",
      };

    case "macAddress":
      // Basic MAC address validation (xx:xx:xx:xx:xx:xx or xx-xx-xx-xx-xx-xx)
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      
      if (!macRegex.test(value)) {
        return {
          isValid: false,
          message: "Invalid MAC address format",
          suggestions: ["00:1A:2B:3C:4D:5E", "00-1A-2B-3C-4D-5E"],
        };
      }

      // Check for uniqueness
      const existingMacDevice = devices.find(
        device => device.macAddress === value && device.id !== deviceId
      );
      
      if (existingMacDevice) {
        return {
          isValid: false,
          message: "This MAC address is already in use",
        };
      }

      return {
        isValid: true,
        message: "Valid and unique MAC address",
      };

    default:
      return {
        isValid: true,
        message: "Validation not implemented for this field",
      };
  }
};

// Function to get suggestions based on current input
export const getSuggestions = async (
  field: string,
  value: string,
  deviceData?: { ipAddress?: string; macAddress?: string }
): Promise<string[]> => {
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock suggestions based on field and current value
  switch (field) {
    case "name":
      if (value.toLowerCase().includes("srv")) {
        return ["SERVER001", "SERVER002", "SRV-DATABASE", "SRV-WEB"];
      }
      if (value.toLowerCase().includes("pc")) {
        return ["PC-FINANCE", "PC-HR", "PC-MARKETING"];
      }
      return [];

    case "room":
      if (value.toLowerCase().includes("off")) {
        return ["Office 101", "Office 102", "Office 201"];
      }
      if (value.toLowerCase().includes("lab")) {
        return ["Lab A", "Lab B", "Laboratory 1"];
      }
      if (value.toLowerCase().includes("ser")) {
        return ["Server Room A", "Server Room B"];
      }
      return [];

    case "description":
      // Generate intelligent description based on IP and MAC address patterns
      if (deviceData?.ipAddress && deviceData?.macAddress) {
        const ipParts = deviceData.ipAddress.split('.');
        const macVendor = deviceData.macAddress.split(':')[0].toUpperCase();
        
        // Mock vendor identification
        const vendorSuggestions: { [key: string]: string[] } = {
          '00': [
            'Dell enterprise server with redundant power supply',
            'Dell workstation optimized for CAD applications'
          ],
          'AC': [
            'Apple device with wireless capabilities',
            'Apple workstation for creative department'
          ],
          '08': [
            'Cisco networking equipment with advanced features',
            'Cisco managed switch with VLAN support'
          ]
        };

        // Generate suggestions based on IP address range
        if (ipParts[2] === '0') {
          return [
            'Core network infrastructure device',
            'Primary gateway device',
            'Network management system'
          ];
        } else if (parseInt(ipParts[2]) >= 100) {
          return [
            'End-user workstation with standard configuration',
            'Department computer with specialized software',
            'Employee desktop with remote access capabilities'
          ];
        }

        // Return vendor-specific suggestions if available
        return vendorSuggestions[macVendor] || [
          'Network device with standard configuration',
          'Managed network endpoint',
          'Department-specific workstation'
        ];
      }

      // Default suggestions if no IP/MAC provided
      if (value.toLowerCase().includes("server")) {
        return [
          "Main database server with RAID configuration",
          "Web server with load balancing capabilities",
          "File server with redundant storage",
        ];
      }
      if (value.toLowerCase().includes("pc")) {
        return [
          "Employee workstation with standard software suite",
          "Finance department computer with specialized applications",
          "Reception desk computer with visitor management system",
        ];
      }
      return [];

    default:
      return [];
  }
};