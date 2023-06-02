// AppScript runs as single file in google.  All variables and methods are available to all other backend files.
const BOT_EMAIL = 'bot@rise8.us'

function doGet() {
  var output = HtmlService.createTemplateFromFile('frontend/index').evaluate()

  output.setTitle('Rise8 Meeting Scheduler')
  output.setFaviconUrl('https://rise8.us/images/favicons/cropped-rise8-favicon-32x32.png')
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1')

  return output
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}
