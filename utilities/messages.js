const moments = require("moment");

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moments().format("h:mm a"),
    };
}
module.exports = formatMessage;
