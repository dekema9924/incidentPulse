"use client";

import { useState, useEffect } from "react";

export default function CurrentDateWidget() {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // This runs only on the client side, ensuring no hydration mismatch
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    setFormattedDate(today.toLocaleDateString("en-US", options));
  }, []);

  return (
    <p className="secondary-text text-xs">{formattedDate || "Loading..."}</p>

  );
}
