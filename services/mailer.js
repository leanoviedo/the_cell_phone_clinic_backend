const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatPrice = (value) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
};
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
        Gracias por tu compra ${customer.firstName} 🙌
      </h3>

      <p style="color:#555;">
        Tu orden <strong>${orderNumber}</strong> fue creada correctamente.
      </p>

      <table width="100%" style="border-collapse:collapse; margin-top:20px; font-size:14px;">
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

      <div style="margin-top:25px; font-size:15px;">
        <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
        <p><strong>Envío:</strong> ${formatPrice(delivery.shippingCost)}</p>
        <h3><strong>Total:</strong> ${formatPrice(totalAmount)}</h3>
      </div>

      <p style="color:#555;">
        Método de entrega: ${delivery.method}
        ${delivery.method === "domicilio" ? `<br/>Dirección: ${delivery.address}, ${delivery.city}` : ""}
      </p>

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

  await transporter.sendMail({
    from: '"La Clínica del Celular" <' + process.env.EMAIL_USER + ">",
    to: customer.email,
    subject: `Confirmación de orden ${orderNumber}`,
    html,
  });
};

module.exports = { sendOrderEmail };
