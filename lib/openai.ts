import { ValidationResult } from "@/types";
import { getAllDevices } from "./devices";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for demo - in production, use server-side API routes
});

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

// Function to generate AI-powered device description using ChatGPT
export const generateAIDescription = async (deviceData: {
  name: string;
  ipAddress: string;
  macAddress: string;
  room: string;
  description?: string;
}): Promise<string> => {
  try {
    // Check if OpenAI API key is available
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      // Fallback to mock AI description for demo
      return generateMockAIDescription(deviceData);
    }

    const prompt = `Based on the following network device information, generate a comprehensive technical description that includes:
- Device purpose and role in the network
- Technical specifications and capabilities
- Security considerations
- Maintenance recommendations
- Network configuration details

Device Information:
- Name: ${deviceData.name}
- IP Address: ${deviceData.ipAddress}
- MAC Address: ${deviceData.macAddress}
- Room/Location: ${deviceData.room}
${deviceData.description ? `- User Description: ${deviceData.description}` : ''}

Generate a professional, technical description (2-3 sentences) suitable for network documentation:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a network administrator and technical documentation expert. Generate concise, professional descriptions for network devices based on their technical specifications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || "AI description generation failed.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to mock description
    return generateMockAIDescription(deviceData);
  }
};

// Mock AI description generator for demo purposes
const generateMockAIDescription = (deviceData: {
  name: string;
  ipAddress: string;
  macAddress: string;
  room: string;
  description?: string;
}): string => {
  const { name, ipAddress, macAddress, room } = deviceData;
  
  // Analyze device type based on name and IP
  const isServer = name.toLowerCase().includes('server') || name.toLowerCase().includes('srv');
  const isPrinter = name.toLowerCase().includes('printer') || name.toLowerCase().includes('print');
  const isSwitch = name.toLowerCase().includes('switch') || name.toLowerCase().includes('sw');
  const isRouter = name.toLowerCase().includes('router') || name.toLowerCase().includes('gw');
  
  // Analyze IP address range
  const ipParts = ipAddress.split('.');
  const subnet = parseInt(ipParts[2]);
  const isInfrastructure = subnet < 10;
  const isServerRange = subnet >= 10 && subnet < 50;
  const isUserRange = subnet >= 100;
  
  // Analyze MAC address for vendor identification
  const macPrefix = macAddress.split(':')[0].toUpperCase();
  const vendors: { [key: string]: string } = {
    '00': 'Dell',
    'AC': 'Apple',
    '08': 'Cisco',
    'D4': 'HP',
    '70': 'Intel',
    'B8': 'Lenovo'
  };
  const vendor = vendors[macPrefix] || 'Generic';
  
  let description = '';
  
  if (isServer) {
    description = `${vendor} enterprise server deployed in ${room} providing critical infrastructure services. Features redundant network connectivity via ${ipAddress} with hardware-level MAC address ${macAddress}. Requires 24/7 monitoring and regular security updates for optimal performance.`;
  } else if (isPrinter) {
    description = `Network-enabled ${vendor} printer stationed in ${room} with static IP assignment ${ipAddress}. Configured for departmental printing services with secure authentication protocols. MAC address ${macAddress} registered for network access control and usage monitoring.`;
  } else if (isSwitch) {
    description = `Managed ${vendor} network switch located in ${room} facilitating local network connectivity. Configured with management IP ${ipAddress} and unique identifier ${macAddress}. Supports VLAN segmentation, QoS policies, and centralized network management protocols.`;
  } else if (isRouter) {
    description = `${vendor} enterprise router positioned in ${room} serving as network gateway with IP ${ipAddress}. Hardware MAC ${macAddress} ensures unique network identification. Implements advanced routing protocols, firewall rules, and bandwidth management for secure connectivity.`;
  } else if (isInfrastructure) {
    description = `Critical network infrastructure device from ${vendor} located in ${room}. Assigned management IP ${ipAddress} with MAC address ${macAddress} for secure administrative access. Essential for network operations and requires priority maintenance scheduling.`;
  } else if (isServerRange) {
    description = `${vendor} server-class device deployed in ${room} with dedicated IP ${ipAddress}. MAC address ${macAddress} registered for secure network access. Configured for high-availability operations with automated monitoring and backup procedures.`;
  } else if (isUserRange) {
    description = `${vendor} end-user workstation located in ${room} with DHCP-assigned IP ${ipAddress}. Network interface MAC ${macAddress} enrolled in corporate security policies. Configured with standard software suite and remote management capabilities.`;
  } else {
    description = `${vendor} network device positioned in ${room} with IP address ${ipAddress} and MAC identifier ${macAddress}. Integrated into corporate network infrastructure with appropriate security policies and monitoring protocols for reliable operation.`;
  }
  
  return description;
};