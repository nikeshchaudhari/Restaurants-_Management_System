import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | Restaurant Management System",
  description: "Sign in to your restaurant dashboard",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <img src="/reslogo.png" alt="logo" className=" object-contain text-white"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurant Management
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to manage your restaurant
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} Restaurant Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
}
