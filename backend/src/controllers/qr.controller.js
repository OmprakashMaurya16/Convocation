const QRCode = require("qrcode");

const generateQRCode = async (req, res) => {
  try {
    const { qrToken } = req.params;

    if (!qrToken) {
      return res
        .status(400)
        .json({ success: false, message: "QR token is required" });
    }

    const qrImage = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    res.json({
      success: true,
      qrToken,
      image: qrImage,
      message: `QR code generated for token: ${qrToken}`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Error generating QR code" });
  }
};

module.exports = {
  generateQRCode,
};
