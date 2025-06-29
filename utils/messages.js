// dependencies
const moment = require('moment-timezone');

function formatMessage(username, text, bot_flag) {
   if (bot_flag==true) {
      username = `🤖 ${username}`;
   }
   return {
      username,
      text,
      time: moment().tz('Asia/Kolkata').format('h:mm a'),
   };
}

module.exports = formatMessage;
