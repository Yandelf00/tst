// src/components/Logo.tsx
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/azyari-logo.png" // Update this path to match your actual logo file
        alt="Azyari Logo"
        width={120}
        height={40}
        className="h-10 w-auto"
      />
    </Link>
  );
}