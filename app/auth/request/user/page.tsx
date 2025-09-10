"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailSchema, nameSchema, phoneSchema } from "@/lib/utils/validation";

const userRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  about: z.string().max(500, 'Опис не може перевищувати 500 символів').optional().or(z.literal('')),
  role: z.enum(["user", "staff", "admin"]),
});

type UserRequestForm = z.infer<typeof userRequestSchema>;

export default function RequestPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserRequestForm>({
    resolver: zodResolver(userRequestSchema),
    defaultValues: {
      role: "user",
      phone: "",
      about: "",
    },
  });

  async function onSubmit(data: UserRequestForm) {
    try {
      setIsLoading(true);
      setMessage("");

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Сталася помилка при відправленні заявки");
      }

      setMessage("Заявку успішно відправлено! Очікуйте на підтвердження.");
      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Невідома помилка";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const roles = [
    { value: "user", label: "Звичайний користувач" },
    { value: "staff", label: "Персонал" },
    { value: "admin", label: "Адміністратор" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Заявка користувача</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("name")}
            className={`w-full border p-3 rounded-lg ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Повне ім'я"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("email")}
            className={`w-full border p-3 rounded-lg ${
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
            {...register("phone")}
            className={`w-full border p-3 rounded-lg ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Номер телефону (необов'язково)"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("about")}
            className={`w-full border p-3 rounded-lg ${
              errors.about ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Про себе (необов'язково, максимум 500 символів)"
            rows={3}
            disabled={isLoading}
          />
          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
          )}
        </div>

        <div>
          <select
            {...register("role")}
            className={`w-full border p-3 rounded-lg ${
              errors.role ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Відправлення..." : "Надіслати заявку"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          message.includes("успішно") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}