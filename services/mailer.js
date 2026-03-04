const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

const sendOrderEmail = async (order) => {
  const { customer, orderNumber, items, subtotal, totalAmount, delivery } =
    order;

  const itemsHtml = items
    .map(
      (item) => `
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
      `,
    )
    .join("");

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
        Gracias por tu compra ${customer.firstName} 🙌</h3>

        <h3 style="color:#555; font-size:15px; font-weight:bold;">
          Tu orden <strong>${orderNumber}</strong> fue creada correctamente.
        </h3>

        <table width="100%" style="border-collapse:collapse; margin-top:20px; font-size:16px;">
          ${itemsHtml}
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
          <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
          <p><strong>Envío:</strong> ${formatPrice(delivery.shippingCost)}</p>
          <h3><strong>Total:</strong> ${formatPrice(totalAmount)}</h3>
        </div>

        <h3 style="color:#555;">
          Método de entrega: ${delivery.method}
          ${
            delivery.method === "envio a domicilio"
              ? `<br/>Dirección: ${delivery.address}, ${delivery.city}`
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

  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: `"La Clínica del Celular" <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: `Tu orden ${orderNumber} ha sido creada`,
    html,
  });

  return info;
};

module.exports = { sendOrderEmail };
