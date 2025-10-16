import nodemailer from "nodemailer";

// 이메일 발송

/* transporterOption
{
  service: "gmail", // 또는 'smtp', 'yahoo', 'outlook' 등 사용하고자 하는 이메일 서비스
  auth: {
    user: "hbsim0605@gmail.com", // 발송할 이메일 주소
    pass: "qjrc wqdk otau kvpg", // 이메일 계정 비밀번호 또는 앱 비밀번호
  },
}
*/

/* mailOption
{
  from: "brunner-admin@brunner-next.com", // 발신자 이메일 주소
  to: "hbsim0605@gmail.com", // 관리자 이메일 주소
  subject: "[brunner-next] New user signed up",
  text: `New user signed up. ID: ${jRequest.userId}, Name:${jRequest.userName}`, // 이메일 본문
}
*/

export const sendMail = async (transporterOption, mailOption) => {
  try {
    const transporter = nodemailer.createTransport(transporterOption);

    const info = await transporter.sendMail(mailOption);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error(
      `Error sending email: message:${error.message}\n stack:${error.stack}\n`
    );
  }
};
