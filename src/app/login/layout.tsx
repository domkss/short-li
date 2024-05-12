import ReCaptchaProvider from "@/components/providers/ReCaptchaProvider";
import { Suspense } from "react";
import LoadingSpinner from "@/components/atomic/LoadingSpinner";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReCaptchaProvider>
      <Suspense
        fallback={
          <div className="my-auto">
            <LoadingSpinner />
          </div>
        }
      >
        {children}
      </Suspense>
    </ReCaptchaProvider>
  );
}
