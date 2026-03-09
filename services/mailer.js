const nodemailer = require("nodemailer");

const formatPrice = (price) => {
  return `$${Number(price).toLocaleString("es-AR")}`;
};

const sendOrderEmail = async (order) => {
  console.log("====================================");
  console.log("INICIANDO SERVICIO MAILER");

  try {
    console.log("Variables de entorno:");

    console.log("ENV EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "ENV EMAIL_PASS:",
      process.env.EMAIL_PASS ? "CARGADO" : "NO CARGADO",
    );
    console.log(
      "ENV MONGODB_URI:",
      process.env.MONGODB_URI ? "CARGADO" : "NO CARGADO",
    );

    console.log("Creando transporter Gmail...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Verificando conexión SMTP...");

    try {
      await transporter.verify();
      console.log("✅ Servidor SMTP listo");
    } catch (smtpError) {
      console.log("❌ Error SMTP:", smtpError);
      throw smtpError;
    }

    console.log("Transporter creado");

    console.log("Email destino:", order.customer.email);

    console.log("Mapeando items de la orden a HTML...");

    const itemsHtml = order.items
      .map((item) => {
        console.log(`Procesando item: ${item.title} x ${item.quantity}`);

        return `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${item.title}
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${item.quantity}
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${formatPrice(item.price)}
          </td>
        </tr>
        `;
      })
      .join("");

    console.log("HTML de items generado");

    console.log("Construyendo plantilla HTML final...");

    const html = `
    <div style="background:#f4f4f4; padding:40px 20px; font-family:Arial, sans-serif;">
      <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">
        
        <div style="text-align:center; margin-bottom:20px;">
          <img 
            src="https://leanoviedo-the-cell-phone-clinic.vercel.app/images/imageslogodog.jpeg" 
            width="140" 
            style="display:block; margin:auto;" 
          />
          <h2 style="margin:10px 0; color:#111;">
            La Clínica del Celular
          </h2>
        </div>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

        <h3 style="margin-bottom:10px;">
          Gracias por tu compra ${order.customer.firstName} 🙌
        </h3>

        <h3 style="color:#555; font-size:15px; font-weight:bold;">
          Tu orden <strong>${order.orderNumber}</strong> fue creada correctamente.
        </h3>

        <table width="100%" style="border-collapse:collapse; margin-top:20px; font-size:16px;">
          <thead>
            <tr style="background:#fafafa;">
              <th align="left" style="padding:10px;">Producto</th>
              <th align="left" style="padding:10px;">Cant.</th>
              <th align="left" style="padding:10px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:25px; font-size:16px;">
          <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
          <p><strong>Envío:</strong> ${formatPrice(order.delivery.shippingCost)}</p>
          <h3><strong>Total:</strong> ${formatPrice(order.totalAmount)}</h3>
        </div>

        <h3 style="color:#555;">
          Método de entrega: ${order.delivery.method}
          ${
            order.delivery.method === "envio a domicilio"
              ? `<br/>Dirección: ${order.delivery.address}, ${order.delivery.city}`
              : ""
          }
        </h3>

        <div style="text-align:center; margin-top:30px;">
          <a 
            href="https://leanoviedo-the-cell-phone-clinic.vercel.app" 
            target="_blank"
            style="
              background:#000;
              color:#fff;
              padding:12px 25px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            "
          >
            Visitar tienda
          </a>
        </div>

        <p style="margin-top:40px; font-size:12px; color:#999; text-align:center;">
          © 2026 La Clínica del Celular<br/>
          Gracias por confiar en nosotros.
        </p>

      </div>
    </div>
    `;

    console.log("Cuerpo HTML finalizado");

    // SI QUIERES VER EL EMAIL COMPLETO EN CONSOLA
    console.log("====== HTML EMAIL ======");
    console.log(html);
    console.log("========================");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Tu orden ${order.orderNumber} en La Clínica del Celular`,
      html,
    };

    console.log("Enviando email con mailOptions:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email enviado correctamente");
    console.log("MessageId:", info.messageId);
  } catch (error) {
    console.log("❌ ERROR EN MAILER");
    console.log("Mensaje:", error.message);
    console.log("Stack:", error.stack);

    throw error;
  }
};

module.exports = sendOrderEmail;
