const nodemailer = require("nodemailer");
const logger = require("./logger");
const AppError = require("./appError");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAILSENDER_HOST,
      port: process.env.EMAILSENDER_PORT,
      secure: false,
      auth: {
        user: process.env.EMAILSENDER_DOMAIN_USERNAME,
        pass: process.env.EMAILSENDER_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: subject,
      text: text,
    });

    if (result.rejected.length) {
      throw new AppError("Failed to send email", 500);
    }

    logger.info("email sent sucessfully");
  } catch (err) {
    logger.error(err.message, "email not sent");
  }
};

module.exports = sendEmail;
