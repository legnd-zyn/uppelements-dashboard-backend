require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendMail({ email, link }) {
  return new Promise(async (resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Account - Action Required",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:200px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">UppElements</a>
        </div>
        <p style="font-size:1.1em;">Hi,</p>
        <p style="text-align:justify;">Thank you for choosing UppElements. Please click on the verify button to continue with your sign-up process. This step is essential to complete your registration. Please note that the OTP you will receive is valid for 5 minutes and should not be shared with anyone.</p>
        <div style="display:flex; justify-content:center; ">
          
        <a href="${link}" target="_blank" style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px; text-decoration:none;">Verify</a>
        </div>
        <p style="font-size:0.9em;">Regards,<br />UppElements</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>UppElements Inc</p>
          <p>Sargodha KotMomin</p>
          <p>Pakistan</p>
        </div>
      </div>
    </div>`,
    };

    try {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(`Email sent: ${info.response}`);
        }
      });
    } catch (error) {
      reject(500);
    }
  });
}

module.exports = { sendMail };
