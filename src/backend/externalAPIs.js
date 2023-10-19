//implement Greenhouse API call function

function createGreenHouseInterview(appId, interviewId, interviewerEmail, start, end, token) {
    // https://developers.greenhouse.io/harvest.html#post-create-scheduled-interview
    //POST 'https://harvest.greenhouse.io/v1/scheduled_interviews'
    // -H "On-Behalf-Of: {greenhouse user ID}"

    let apiUrl = 'https://harvest.greenhouse.io/v2/scheduled_interviews'

    let payload = {
        "application_id": parseInt(appId),
        "interview_id": parseInt(interviewId),
        "interviewers": [
            {
                "email": interviewerEmail,
                "response_status": "accepted"
            }
        ],
        "start": start,
        "end": end,
        "external_event_id": "neverl8_event_id_" + new Date().getTime(),
        "location": "Google Meet"
    }

    let payloadString = JSON.stringify(payload);

    let options = {
        method: 'post',
        contentType: 'application/json',
        payload: payloadString,
        headers: {
            Authorization: 'Basic ' + token,
            'On-Behalf-Of': 4087854007
        }
    };

    UrlFetchApp.fetch(apiUrl, options)

}