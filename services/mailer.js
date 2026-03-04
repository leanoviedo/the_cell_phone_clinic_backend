const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderEmail = async () => {
  const mailOptions = {
    from: `Galigniana - Todo para el Agro <${process.env.EMAIL_USER}>`,
    to,
    subject: "Confirmación de tu compra - Código de retiro",
    html: (
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: Arial, sans-serif;">
        <h2 style="text-align:center;">Tu pedido está listo para retirar</h2>
        <p style="text-align:center;">Código de retiro:</p>
        <p style="text-align:center;">Entregado por: </p>
        <img
          src="${deliveryPersonImage}"
          alt="Imagen del repartidor"
          style="display:block; margin:auto; width:150px; height:150px; border-radius:50%; object-fit:cover;"
        />
      </div>
    ),
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOrderEmail;

module.exports = { sendOrderEmail };
