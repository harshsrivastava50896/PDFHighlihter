import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {environment} from "../../environments/environment";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient:HttpClient) { 
    
  }

  /**
   * Add Merge Fields to the document
   * @param templateID id of the  document
   * @param mergeFields MergeFieldContainer
   */
  public AddMergeFields(templateID:string, mergeFields):Observable<any> {
    let url = environment.AddMergeFields +"?docID="+ templateID;
    return this.httpClient.post(url,{mergeFields:mergeFields})
  }

  /**
   * Generate Template in server 
   * @param templateID id of the  document
   */
  public GenerateTemplate(templateID:string):Observable<any>{
    let url = environment.GenerateTemplate+"?id=" + templateID;
    return this.httpClient.post(url,null);
  }

  /**
   * Generic Method to download files from Applictaion S3 bucket  
   * @param templateID document Template ID 
   * @param type Type as defiend by constants.S3DocType
   */
  public S3Download(templateID:string, type:string):Observable<any>{
    let url = environment.S3Download;
    let headers = new HttpHeaders();
    let requestBody = {
      "TemplateId": templateID,
      "Type": type
    }
    return this.httpClient.post<any>(url,requestBody); 
  }

  /**
   * Method to upload PDF documents to application S3 bucket
   * @param fileInBase64 input pdf file in base64 format. Excpects the base64 in UTF-8 encoding.
   * @param filePath The file path in s3 where it needs to be stored
   */
  public S3Upload(fileInBase64:string,filePath:string):Observable<any>{
    let url = environment.S3Upload;
    let headers = new HttpHeaders();
    let requestBody = {
      data:fileInBase64,
      filePath:filePath
    }
    return this.httpClient.post(url,requestBody);

  }

  /**
   * Run Spacy NLP for the given source pdf under template id 
   * @param templateID Template ID of the document
   */
  public GenerateMLMap(templateID:string):Observable<any>{
    let url = environment.GenerateMLMap+"?id="+templateID;
    return this.httpClient.get(url);
  }

  /**
   * Get List of all templates within the application
   */
  public GetTemplateDetails():Observable<any>{
    let url = environment.GetTemplateDetails;
    return this.httpClient.get(url);
  }

  /**
   * Get list of all applictaion registerd to LFG
   */
  public GetAllApplications():Observable<any>{
    let url = environment.GetAllApplication;
    return this.httpClient.get(url);
  }

  /**
   * Actual merge of the document with selected data source
   * @param templateID Template id of the document 
   * @param appName Application name registered
   */
  public MailMerge(templateID:string,appName:string):Observable<any>{
    let url = environment.MailMerge+"?id="+templateID + "&app="+appName;
    return this.httpClient.post(url,null);

  }

  /**
   * Get the input PDF in binary format.
   * @param templateId Template id of the document
   * @param templateName Name of the document
   */
  public GetPdfDetails(templateId : string, templateName : string){
    let url = environment.GetPdfDetails + '?TemplateId='+templateId+'&TemplateName='+templateName;
    return this.httpClient.get(url);
  }

  /**
   * Get the list of all Entity merge fields registered under an application
   * @param applicationName Application name registered
   */
  GetMergeFieldsNames(applicationName : string):Observable<any> {
    let url = "environment.GetSourceDynamoDBDetails + '?Application='+applicationName";
    return this.httpClient.get(environment.GetSourceDynamoDBDetails + '?Application='+applicationName);
  }
  




}
