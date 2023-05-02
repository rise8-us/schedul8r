const MEETINGS_FILE_NAME = "Meetings";
const HOST_PREFRENCES_FILE_NAME = "MeetingHosts"

function doGet(e) {
    return HtmlService.createTemplateFromFile('ui/index').evaluate();
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}
