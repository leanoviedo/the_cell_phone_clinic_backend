const nodemailer = require("nodemailer");

const formatPrice = (price) => {
  return `$${Number(price).toLocaleString("es-AR")}`;
};

const sendOrderEmail = async (order) => {
  console.log("=================================================");
  console.log("📨 INICIANDO SERVICIO MAILER");

  const startTime = Date.now();

  try {
    console.log("📦 Datos de orden recibidos");

    if (!order) {
      console.log("❌ ERROR: order es undefined");
      throw new Error("Order undefined");
    }

    console.log("OrderNumber:", order.orderNumber);
    console.log("Cliente:", order.customer?.firstName);
    console.log("Email cliente:", order.customer?.email);

    console.log("Cantidad de items:", order.items?.length);

    console.log("====================================");
    console.log("🔐 Variables de entorno");

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "CARGADO" : "NO CARGADO",
    );
    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI ? "CARGADO" : "NO CARGADO",
    );

    console.log("====================================");
    console.log("📡 Creando transporter Gmail...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("🔎 Verificando conexión SMTP...");

    try {
      await transporter.verify();

      console.log("✅ Servidor SMTP listo");
    } catch (smtpError) {
      console.log("❌ ERROR SMTP");
      console.log(smtpError);

      throw smtpError;
    }
    const getDeliveryLabel = (method) => {
      if (method === "local") return "Retiro en local";
      if (method === "domicilio") return "Envío a domicilio";
      return method;
    };
    console.log("====================================");
    console.log("📨 Preparando email para:", order.customer.email);

    console.log("Mapeando items...");

    const itemsHtml = order.items
      .map((item) => {
        console.log(
          `Item -> ${item.title} | Cantidad: ${item.quantity} | Precio: ${item.price}`,
        );

        return `
<tr style="border-bottom:1px solid #eee;">
  <td style="padding:12px; font-weight:500; color:#111;">
    ${item.title}
  </td>
  <td align="center" style="padding:12px; color:#555;">
    ${item.quantity}
  </td>
  <td align="right" style="padding:12px; font-weight:bold; color:#111;">
    ${formatPrice(item.price)}
  </td>
</tr>
`;
      })
      .join("");

    console.log("✅ HTML items generado");

    console.log("Construyendo HTML final...");

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

        <h3>Gracias por tu compra ${order.customer.firstName} 🙌</h3>

        <h3 style="color:#555; font-size:15px;">
          Tu orden <strong>${order.orderNumber}</strong> fue creada correctamente.
        </h3>

        <table width="100%" style="border-collapse:collapse; margin-top:20px;">
          <thead>
  <tr style="background:#f1f5f9; text-transform:uppercase; font-size:12px; letter-spacing:1px; color:#555;">
    <th align="left" style="padding:12px;">Producto</th>
    <th align="center" style="padding:12px;">Cant.</th>
    <th align="right" style="padding:12px;">Precio</th>
  </tr>
</thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

    <div style="margin-top:25px;">
  <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>

  ${
    order.delivery.method === "domicilio"
      ? `<p><strong>Envío:</strong> ${formatPrice(order.delivery.shippingCost)}</p>`
      : ""
  }

  <h3><strong>Total:</strong> ${formatPrice(order.totalAmount)}</h3>
</div>

       <h3>
  Método de entrega: ${getDeliveryLabel(order.delivery.method)}
  ${
    order.delivery.method === "domicilio"
      ? `<br/>Dirección: ${order.delivery.address}, ${order.delivery.city}`
      : ""
  }
</h3>

      </div>
    </div>
    `;

    console.log("✅ HTML final construido");

    console.log("====================================");
    console.log("📤 Preparando envío de email");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Tu orden ${order.orderNumber} en La Clínica del Celular`,
      html,
    };

    console.log("MailOptions:");

    console.log({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length,
    });

    console.log("====================================");
    console.log("🚀 Enviando email...");

    const info = await transporter.sendMail(mailOptions);

    const endTime = Date.now();

    console.log("✅ EMAIL ENVIADO CORRECTAMENTE");

    console.log("MessageId:", info.messageId);

    console.log("Tiempo de envío:", endTime - startTime, "ms");
  } catch (error) {
    console.log("====================================");
    console.log("❌ ERROR EN MAILER");

    console.log("Mensaje:", error.message);

    console.log("Stack:", error.stack);

    console.log("Datos de orden que causaron error:");
    console.log(JSON.stringify(order, null, 2));

    throw error;
  }
};

module.exports = sendOrderEmail;
