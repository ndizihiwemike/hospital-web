
const nodemailer = require('nodemailer');

  // Create a Nodemailer transporter using Yandex SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    auth: {
        user: 'r0otandvine@yandex.com',
        pass: 'jviavqbdopeuaora'
      }
  });
  
  // Variable to keep track of the number of pending tasks
  let pendingTasks = 0;
  
  // Function to send an email with attachments to one or multiple recipients
  function sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {
      pendingTasks++;
      transporter.sendMail(mailOptions, (error, info) => {
        pendingTasks--;
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
  
  // Function to get the number of pending tasks
  function getPendingTaskCount() {
    return pendingTasks;
  }
  
  module.exports = {
    sendEmail,
    getPendingTaskCount
  };
  