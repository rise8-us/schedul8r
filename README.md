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
