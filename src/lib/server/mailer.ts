import fs from "fs/promises";

class Mailer {
  static async SendPasswordResetTokenMail(email: string, token: string) {
    const nodemailer = require("nodemailer");

    const host = process.env.NODEMAILER_ENDPOINT;
    const port = process.env.NODEMAILER_PORT;
    const user = process.env.NODEMAILER_USER;
    const password = process.env.NODEMAILER_PASSWD;

    if (!host || !port || !user || !password) {
      console.error("NodeMailer configuration is incorrect");
      return;
    }

    var transport = nodemailer.createTransport({
      host: host,
      port: port,
      auth: {
        user: user,
        pass: password,
      },
    });

    const sender = {
      address: "noreply@sli.ink",
      name: "ShortLi",
    };

    const emailTemplatePath = "resources/email-templates/reset-password/index.html";
    let data = await fs.readFile(emailTemplatePath, "utf-8").catch(console.error);
    if (data) {
      data = replacePlaceholder(data, "RESET_TOKEN", token);

      transport
        .sendMail({
          from: sender,
          to: email,
          subject: "ShortLi Password Reset Token",
          html: data,
        })
        .catch(console.error);
    }
  }
}

const replacePlaceholder = (htmlContent: string, placeholder: string, value: string): string => {
  return htmlContent.replace(new RegExp(`{{${placeholder}}}`, "g"), value);
};

export default Mailer;
