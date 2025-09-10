"use client";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();

  function handleSelect(role: "user" | "researcher") {
    if (role === "user") {
      router.push("/auth/request/user");
    } else {
      router.push("/auth/request/researcher");
    }
  }

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/requests/auth/logout");
      if (res.status === 200) {
        localStorage.removeItem("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center px-6 lg:px-8">
        <Link href={"/admin"} className="flex items-center">
          <Image src={"/globe.svg"} alt="user" width={50} height={50} />
          <span className="text-2xl font-bold text-gray-800 mx-2">
            User data
          </span>
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => handleSelect("user")}
            className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700"
          >
            Користувач
          </button>
          <button
            onClick={() => handleSelect("researcher")}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
          >
            Дослідник
          </button>
        </div>
        <div className="items-center gap-4 hidden md:flex">
          <button onClick={() => router.push("/auth/request/login")}>
            Sign in
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded disabled:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
