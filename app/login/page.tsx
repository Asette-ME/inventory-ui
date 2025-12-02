import Image from "next/image";

import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import LoginImage from "@/public/img/login.jpg";
import Logo from "@/public/img/logo.jpg";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={LoginImage}
          alt="Login"
          className="absolute inset-0 h-full w-full object-top object-cover"
        />
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Image src={Logo} alt="Logo" width={24} height={24} />
            Asette.ai
          </div>

          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
