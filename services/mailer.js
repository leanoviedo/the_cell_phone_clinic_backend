const nodemailer = require("nodemailer");

/* =========================================
   TRANSPORTER VERCEL + GMAIL FIX
========================================= */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // 🔥 CLAVE PARA VERCEL
  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

/* =========================================
   VERIFICAR SMTP
========================================= */

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP conectado correctamente");
  }
});

/* =========================================
   FORMATEAR PRECIO
========================================= */

const formatPrice = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);

/* =========================================
   ENVIAR EMAIL
========================================= */

const sendOrderEmail = async (order) => {
  try {
    console.log("📧 Enviando email...");

    const { customer, orderNumber, items, subtotal, totalAmount, delivery } =
      order;

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.quantity}</td>
          <td>${formatPrice(item.price)}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <h2>Gracias por tu compra ${customer.firstName} 🙌</h2>
      <p>Orden: <strong>${orderNumber}</strong></p>

      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p>Subtotal: ${formatPrice(subtotal)}</p>
      <p>Envío: ${formatPrice(delivery.shippingCost)}</p>
      <h3>Total: ${formatPrice(totalAmount)}</h3>
    `;

    const info = await transporter.sendMail({
      from: `"La Clínica del Celular" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: `Confirmación de orden ${orderNumber}`,
      html,
    });

    console.log("✅ Email enviado:", info.response);
  } catch (error) {
    console.error("❌ ERROR REAL EMAIL:", error);
    throw error;
  }
};

module.exports = { sendOrderEmail };