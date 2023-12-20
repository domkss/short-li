import ReCaptchaProvider from "@/components/Providers/ReCaptchaProvider";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <ReCaptchaProvider>{children}</ReCaptchaProvider>;
}
