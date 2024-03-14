import ReCaptchaProvider from "@/components/providers/ReCaptchaProvider";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <ReCaptchaProvider>{children}</ReCaptchaProvider>;
}
