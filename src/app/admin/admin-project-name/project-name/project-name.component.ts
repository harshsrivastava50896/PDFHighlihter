import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-project-name',
  templateUrl: './project-name.component.html',
  styleUrls: ['./project-name.component.scss']
})
export class ProjectNameComponent implements OnInit {
  List:any[] = ['Hello','Brother','Michael'];
  private fieldArray: Array<any> = [];
  public projects = [];
  urlSource:any;
  projectName:string;
  dataLoaded:boolean = false;
  addProj:boolean = false;
  currentApplication:boolean = false;
  projectModel:ProjectModel[];
  public s :string = "Hello";
  currentApplicationDetails = [];
  private newAttribute: any = {};
  urlGetAllApplications:string = 'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getAllApplications';
  urlFetchDetails:string = '';
  constructor(private http:HttpClient) { 
    this.projectModel = [];
    this.http.get(this.urlGetAllApplications).subscribe((x:[]) => {
      console.log(x);
      this.projects = x;
    });
   
  }

  ngOnInit() {
    
    
  }
  addFieldValue() {
    this.fieldArray.push(this.newAttribute)
    this.newAttribute = {};
}

deleteFieldValue(index) {
    this.fieldArray.splice(index, 1);
}
addProject(){
  this.addProj = true;
}
getCurrentApplication(index){
  this.currentApplication = true;
  var url = 'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getSourceDynamodbDetails?Application=' + this.projects[index]; 
  this.http.get(url).subscribe((x:[])=> {
    console.log(x);
    this.currentApplicationDetails = x;
  })

}
cancelProject(){
  this.currentApplication = false;
}
getevent(event){
  console.log(event);
  this.getCurrentApplication(event);
}
fetchDetails(){
  
  let headers: HttpHeaders = new HttpHeaders();
 
  headers.append("Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key");
  headers.append("Access-Control-Allow-Origin", "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/"); // Remove this and add s3 URL after deploy
  headers.append("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");
  //this.urlFetchDetails = this.urlFetchDetails.toLowerCase();
  console.log(this.urlFetchDetails);
  this.dataLoaded = true;
  this.http.get(this.urlFetchDetails,{headers:headers}).subscribe((model:any) =>{
  console.log(model);
 
   
   
  this.projectModel = model.SourceDetail;
  
  
 });
  
}

}
class ProjectModel {
  constructor(){}
  Application: string;
  AttributeName: string;
  FieldName: string;
  FieldParent: string;
  SourceLink: string;
  
}
