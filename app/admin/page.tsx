"use client";

import { useEffect, useState } from "react";

type Request = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  about?: string;
  passportNumber?: string;
  directorApprovalUrl?: string;
  createdAt: string;
};

type ApprovalResult = {
  userId: string;
  generatedPassword: string;
  emailSent: boolean;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let token = getAccessToken();

    if (!token) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          token = data.accessToken;
          if (token) {
            localStorage.setItem("access_token", token);
          }
        } else {
          throw new Error("No valid token");
        }
      } catch (error) {
        localStorage.removeItem("access_token");
        window.location.href = "/auth/request/login";
        throw new Error("Unauthorized");
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // нада буде забрати Bearer token
        ...options.headers,
      },
    });

    if (response.status === 401) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("access_token", data.accessToken);
          token = data.accessToken;

          return fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // нада буде забрати Bearer token
              ...options.headers,
            },
          });
        } else {
          throw new Error("Refresh failed");
        }
      } catch (error) {
        localStorage.removeItem("access_token");
        window.location.href = "/auth/request/login";
        throw new Error("Unauthorized");
      }
    }

    if (response.status === 403) {
      window.location.href = "/";
      throw new Error("Forbidden");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async function fetchRequests() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth("/api/requests");
      if (response.redirected) {
        return;
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        console.error("Unexpected response format:", data);
        setRequests([]);
        setError("Невірний формат відповіді сервера");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Forbidden") {
        console.error("Error fetching requests:", error);
        setError("Помилка завантаження заявок");
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      setIsProcessing(id);
      const response = await fetchWithAuth(`/api/requests/${id}/approve`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Помилка схвалення заявки");
      }

      setApprovalResult({
        userId: result.userId,
        generatedPassword: result.generatedPassword,
        emailSent: result.emailSent,
      });

      await fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      alert(
        error instanceof Error ? error.message : "Помилка схвалення заявки"
      );
    } finally {
      setIsProcessing(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Ви впевнені, що хочете відхилити цю заявку?")) {
      return;
    }

    try {
      setIsProcessing(id);
      await fetchWithAuth(`/api/requests/${id}/reject`, {
        method: "POST",
      });

      await fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Помилка відхилення заявки");
    } finally {
      setIsProcessing(null);
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "researcher":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Адмін";
      case "researcher":
        return "Дослідник";
      case "staff":
        return "Персонал";
      case "user":
        return "Користувач";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("uk-UA");
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token");
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin" && payload.role !== "staff") {
        window.location.href = "/";
        return;
      }
    } catch (error) {
      localStorage.removeItem("access_token");
      window.location.href = "/auth/request/login";
      return;
    }
    fetchRequests();
  }, []);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-2xl mt-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-2xl mt-6">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          <p className="font-semibold">Помилка:</p>
          <p>{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-2xl mt-6">
      <h1 className="text-2xl font-bold mb-6">Заявки на реєстрацію</h1>

      {approvalResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-green-600">
              Користувача схвалено!
            </h2>
            <div className="space-y-3">
              <p>
                <strong>ID користувача:</strong> {approvalResult.userId}
              </p>
              <p>
                <strong>Пароль:</strong>
                <span className="bg-yellow-100 p-2 rounded font-mono block mt-1 break-all">
                  {approvalResult.generatedPassword}
                </span>
              </p>
              <p
                className={
                  approvalResult.emailSent ? "text-green-600" : "text-red-600"
                }
              >
                {approvalResult.emailSent
                  ? "Пароль відправлено на email"
                  : "Не вдалося відправити email"}
              </p>
              <p className="text-sm text-orange-600">
                Збережіть цей пароль! Він більше не буде показаний.
              </p>
            </div>
            <button
              onClick={() => setApprovalResult(null)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Немає заявок на розгляд</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="border p-4 rounded-xl bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{req.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(req.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                    req.role
                  )}`}
                >
                  {translateRole(req.role)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{req.email}</p>
                </div>
                {req.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Телефон</p>
                    <p className="font-medium">{req.phone}</p>
                  </div>
                )}
              </div>

              {req.about && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Про себе</p>
                  <p className="text-gray-800">{req.about}</p>
                </div>
              )}

              {req.role === "researcher" && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Дані дослідника:</h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-sm text-gray-600">Паспорт:</span>{" "}
                      {req.passportNumber || "Не вказано"}
                    </p>
                    <p>
                      <span className="text-sm text-gray-600">
                        Заява директора:
                      </span>{" "}
                      {req.directorApprovalUrl ? (
                        <a
                          href={req.directorApprovalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Перейти до документу
                        </a>
                      ) : (
                        "Не вказано"
                      )}
                    </p>
                  </div>
                </div>
              )}

              {(req.role === "admin" || req.role === "staff") && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Адміністративний доступ:
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Цей користувач отримає адміністративні права після схвалення
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-3 border-t">
                <button
                  onClick={() => handleApprove(req._id)}
                  disabled={isProcessing === req._id}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing === req._id ? "Обробка..." : "Схвалити"}
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={isProcessing === req._id}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing === req._id ? "Обробка..." : "Відхилити"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
