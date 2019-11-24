// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  AddMergeFields: "https://hwaj48yuj9.execute-api.us-east-1.amazonaws.com/Dev/addmergefields",
  GenerateTemplate:"https://s7qljl48a0.execute-api.us-east-1.amazonaws.com/test/generatetemplate",
  S3Download:"https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/download",
  S3Upload:"https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/upload",
  MailMerge:"https://uo07tg7tf3.execute-api.us-east-1.amazonaws.com/test/mailmerge",
  GenerateMLMap:"https://y6hl1i714a.execute-api.us-east-1.amazonaws.com/test/ML",
  GetTemplateDetails:"https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getTemplateDetails",
  GetPdfDetails:"https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/s3DownloadPDF",
  GetSourceDynamoDBDetails:'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getSourceDynamodbDetails',
  GetAllApplication:"https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getAllApplications",
  CLIENT_URL:"http://localhost:4200/"
  


};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
