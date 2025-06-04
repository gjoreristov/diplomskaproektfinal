import { User } from "@/types";

// Mock authentication for demo purposes
// In a real application, this would connect to a database or authentication service

const USERS: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
  },
];

export const authenticateUser = (email: string, password: string): User | null => {
  // For demo purposes, we're not checking the password
  // In a real application, you would verify credentials properly
  const user = USERS.find((u) => u.email === email);
  return user || null;
};

export const getCurrentUser = (): User | null => {
  // In a real application, you would verify the token and fetch the user
  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin";
};