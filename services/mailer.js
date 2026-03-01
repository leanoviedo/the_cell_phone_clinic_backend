import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("✅ Transporter creado");

  return transporter;
}

export default async function handler(req, res) {
  try {
    const { firstName, lastName, email, message } =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const transporter = getTransporter();

    const mailData = {
      from: `"${firstName} ${lastName}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: "📩 Nuevo mensaje",
      text: message,
      html: `<p>${message}</p>`,
    };

    // ✅ nodemailer ya usa promises
    await transporter.sendMail(mailData);

    return res.status(200).json({
      status: "OK",
      message: "Email enviado",
    });
  } catch (error) {
    console.error("❌ Email error:", error);

    return res.status(500).json({
      status: "ERROR",
    });
  }
}