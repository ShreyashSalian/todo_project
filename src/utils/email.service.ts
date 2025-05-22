import nodemailer from "nodemailer";
export const sendEmailReminder = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: process.env.MAIL_SERVICE,
      port: 465,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: `${to}`,
      subject: subject,
      text: text,
    });
    console.log(
      "Preview URL: %s-------------------",
      nodemailer.getTestMessageUrl(info)
    );
  } catch (err) {
    console.log(err, "err-------------");
  }
};
