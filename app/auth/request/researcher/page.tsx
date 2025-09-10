"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailSchema, nameSchema, phoneSchema, passportSchema, urlSchema } from "@/lib/utils/validation";

const researcherSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  about: z.string().max(500, 'Опис не може перевищувати 500 символів').optional().or(z.literal('')),
  role: z.literal("researcher"),
  passportNumber: passportSchema,
  directorApprovalUrl: urlSchema,
});

type ResearcherForm = z.infer<typeof researcherSchema>;

export default function ResearcherRequestPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResearcherForm>({
    resolver: zodResolver(researcherSchema),
    defaultValues: {
      role: "researcher",
      phone: "",
      about: "",
    },
  });

  async function onSubmit(data: ResearcherForm) {
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Заявка дослідника</h1>
      
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
          <input
            {...register("passportNumber")}
            className={`w-full border p-3 rounded-lg ${
              errors.passportNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Паспорт"
            disabled={isLoading}
          />
          {errors.passportNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.passportNumber.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("directorApprovalUrl")}
            className={`w-full border p-3 rounded-lg ${
              errors.directorApprovalUrl ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Посилання на заяву директора"
            disabled={isLoading}
          />
          {errors.directorApprovalUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.directorApprovalUrl.message}</p>
          )}
        </div>

        <input type="hidden" {...register("role")} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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