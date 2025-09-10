"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/utils/validation";

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      setIsLoading(true);
      setMessage("");

      const res = await fetch("/api/requests/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        throw new Error("Помилка авторизації");
      }

      localStorage.setItem("access_token", responseData.accessToken);
      setMessage("Успішний вхід! Перенаправлення...");
      
      // Перенаправление через короткое время
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Помилка авторизації";
      setMessage(errorMessage);
      setError("root", { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Вхід</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            placeholder="Email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("password")}
            className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            type="password"
            placeholder="Пароль"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Вхід..." : "Увійти"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          message.includes("Успішний") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}