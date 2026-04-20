const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const qrToken = process.argv[2] || "23101A0030";
const outputDir = path.join(__dirname, "../../public/qr-codes");

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `${qrToken}.png`);

QRCode.toFile(
  outputFile,
  qrToken,
  {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  },
  (err) => {
    if (err) {
      console.error("Error generating QR code:", err.message);
      process.exit(1);
    }
    console.log(`✅ QR Code generated successfully!`);
    console.log(`📁 File: ${outputFile}`);
    console.log(`📱 Content/Token: ${qrToken}`);
  },
);
