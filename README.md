# Schedul8r
- Connect to personal or a shared calendar to share availability for meeting with guests
# Dev Setup
1. create an apps [script project](https://developers.google.com/apps-script/guides/projects) in your Google Drive 
1. Get the Script Id from Project Settings page
1. copy and `.example.clasp.json` to `.clasp.json` and update the `scriptId` with your scriptId from step 2
1. install [clasp](https://developers.google.com/apps-script/guides/clasp)
1. login to google with clasp, you will need to update some settings in google your first time
1. push to google

```shell
## example cli commands
> npm install @google/clasp -g
> clasp login
> clasp push
```
