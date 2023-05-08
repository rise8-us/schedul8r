// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
const MEETINGS_FILE_NAME = "Meetings";
const HOST_PREFRENCES_FILE_NAME = "MeetingHosts";
const BOT_EMAIL = "bot@rise8.us"

function doGet(e) {
  return HtmlService.createTemplateFromFile("frontend/index").evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
