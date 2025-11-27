import Image from "next/image";
import LoginForm from "./LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRoleRedirect(user.role));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-lamaSkyLight to-blue-200">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-3 mb-3">
            <Image src="/logo.png" alt="Logo GEOX School" width={150} height={150} />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">GEOX School</h1>
          <h2 className="text-lg text-gray-500 font-medium">Connectez-vous à votre compte</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
