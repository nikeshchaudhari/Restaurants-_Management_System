"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100-white">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        </div>

        {/* form */}

        <form>
          {/* username */}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>

            <div className="group relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserRound className=" group-focus-within:text-orange-500" />
              </div>

              <input
                id="username"
                name="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                required
                value={username}
                disabled={loading}
                className="block w-full pl-13 pr- py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 disabled:bg-red-500 disabled:cursor-not-allowed"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className=" group relative">
              <div className="absolute inset-y-0 left-0  pl-3 flex items-center pointer-events-none ">
                <LockKeyhole className="  group-focus-within:text-orange-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password"
                className="block w-full pl-13 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 disabled:bg-red-500 disabled:cursor-not-allowed "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className=" absolute inset-y-0 right-0 pr-3"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>

          {/*remember  */}
          <div className="flex items-center gap-2 mt-3">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4"
            />

            <label htmlFor="rememberMe" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>
          {/* Login Button */}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mt-3"
          >
            {loading ? <>Login In...</> : <>Login</>}
          </button>
        </form>
      </div>
    </>
  );
}
