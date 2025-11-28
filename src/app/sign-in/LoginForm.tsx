"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { backendFetch } from "@/lib/backend";

type FormState = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de se connecter.");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erreur réseau.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6">
      {error && (
        <div className="bg-red-100 text-red-600 text-sm p-2 rounded">{error}</div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-semibold mb-1">
          Nom d&apos;utilisateur
        </label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          placeholder="Entrez votre nom d'utilisateur"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-semibold mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
          placeholder="Entrez votre mot de passe"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg text-base py-3 mt-2 shadow-md disabled:opacity-60"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

