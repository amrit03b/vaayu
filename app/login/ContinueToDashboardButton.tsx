"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { isCivicAuthenticated, hasWallet } from "@/lib/civic";

export default function ContinueToDashboardButton() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAuthed(isCivicAuthenticated() && hasWallet());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthed) return null;

  return (
    <Link href="/dashboard">
      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
        Continue to Dashboard
      </button>
    </Link>
  );
} 