import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class MergeFieldGeneratorService {
  constructor(private httpService: HttpClient) { }

  getDictionaryDetails(templateId: any): Observable<any> {
    return this.httpService.post(
      'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/download',
      {
        TemplateId: templateId,
        Type: 'Dictionary'
      },
      httpOptions
    );
  }
  getMergeFieldsNames():Observable<any> {
    return this.httpService.get('https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/sourceDetails');
  }
  getPdfDetails(templateId : string, templateName : string){
    return this.httpService.get('https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/s3DownloadPDF?TemplateId='+templateId+'&TemplateName='+templateName);
  }
}
