# Schedul8r

- Connect to personal or a shared calendar to share availability for meeting with guests

# Dev Setup

1. create an apps [script project](https://developers.google.com/apps-script/guides/projects) in your Google Drive
1. copy the [meetingDB](https://docs.google.com/spreadsheets/d/1eQYN_rjOo6gbBFfr7b3atg5DjTQ0WC1VK9jUZpFDtsk/edit?usp=sharing) sheet to the same location you created in step 1
1. update meetingDB with your values.
1. Get the Script Id from Project Settings page
1. copy and `.example.clasp.json` to `.clasp.json` and update the `scriptId` with your scriptId from step 2
1. install [clasp](https://developers.google.com/apps-script/guides/clasp)
1. login to google with clasp, you will need to update some settings in google your first time
1. push to google

```shell
## example cli commands
> npm install @google/clasp -g
> clasp login
> npm run build:push
```

### Deploying locally

To deploy locally, execute `npm run build:push`. This will bundle up everything in the /src folder and push it to the Google App Script with the ID in your .clasp.json.

### Deploying a static release

If you want to use a specific descriptor name, the script looks for `RELEASE_NAME` from the environment. If it is not set it will default to `schedul8r`. Running the following command will create a new deployment with the specific descriptor from above. If the deployment already exists then it will update the existing deployment with the latest code.

```sh
npm run deploy
```

# Configuring meetings

Configuration takes place directly in a spreadsheet.

Meeting fields

```js
id:"sync_15", //this will be passed in as a url param e.g. http://script.google.../exec?meetingType=<id>
calendar: "jwills@rise8.us", //can be a shared calendar or your primary calendar
duration: 15, //duration of the meeting in minutes entered as an integer
title: "15 min Sync up", //This is will be what is seen on the google calendar
description: "Additional info to help guest understand purpose of meeting",
hosts: "jwills@rise8.us, dlamberson@rise8.us", // comma seperated list the possible hosts, must match host obect id field. NeverL8 will randomly
// select a host from this list.  Helpful for sharing tasks like interviewing
hasBotGuest: false // boolean.  Add a bot if you want it to perform additional tasks, such as prep github for an interview
```

Host fields

```js
email: "jwills@rise8.us", // this is used to invite the host to the meeting if using a shared calendar. this must match what is used in the hosts entry from the meeting object doesn't need to be email
timeZone: "America/New_York", //TimeZone of the host. See link below for correct TZ indentifier values
officeHours: "9,17", // comma separated values of the starting and ending hour of your day using the 24hr clock
buffers: "15,15" // buffers in minutes ensures free time before or after the meeting
```

[Time Zone Identifiers](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
