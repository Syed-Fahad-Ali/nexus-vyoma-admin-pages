import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <Suspense fallback={null}>
        <SignIn fallbackRedirectUrl="/events" />
      </Suspense>
    </main>
  );
}
