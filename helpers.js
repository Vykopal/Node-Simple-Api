
var fs = require("fs");
const countFileName = "jsonData.json";

function logError(err) {
    if (err) {
        this.message && console.error(this.message);
        console.error(err);
    }
}
function appendToFile(data) {
    fs.appendFile(countFileName, JSON.stringify(data), logError.bind({ message: "Failed to append data to " + countFileName }));
}

module.exports = { "logError": logError, "countFileName": countFileName, "appendToFile": appendToFile, "fileSystem": fs };
