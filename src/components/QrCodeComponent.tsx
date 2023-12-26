import QRCodeStyling from "qr-code-styling";
import { useRef, useState, useEffect } from "react";

export default function QrCodeComponent() {
  const [url, setUrl] = useState("https://qr-code-styling.com");
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) qrCode.append(ref.current);
  }, []);

  useEffect(() => {
    qrCode.update({
      data: url,
    });
  }, [url]);

  return <div ref={ref} />;
}

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  dotsOptions: {
    color: "#4267b2",
    type: "rounded",
  },
});
