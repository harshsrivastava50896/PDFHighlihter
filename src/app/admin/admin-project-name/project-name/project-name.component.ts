import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  dataLoaded:boolean = false;
  projectModel:any[];
  public s :string = "Hello";
  private newAttribute: any = {};
  urlGetAllApplications:string = 'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getAllApplications';
  urlFetchDetails:string = '';
  constructor(private http:HttpClient) { 
    this.projectModel = [];
   
  }

  ngOnInit() {
    
    this.http.get(this.urlGetAllApplications).subscribe((x:[]) => {
      console.log(x);
      this.projects = x;
    });
  }
  addFieldValue() {
    this.fieldArray.push(this.newAttribute)
    this.newAttribute = {};
}

deleteFieldValue(index) {
    this.fieldArray.splice(index, 1);
}
fetchDetails(){
  console.log(this.s);
  
  this.urlFetchDetails = this.urlFetchDetails.toLowerCase();
  console.log(this.urlFetchDetails);
  this.dataLoaded = true;
  this.http.get(this.urlFetchDetails).subscribe((model:any) =>{
  console.log(model);
 
   
   
  this.projectModel = model.SourceDetail;
  
 });
  
}

}
class ProjectModel {
  constructor(){}
  application: string;
  AttributeName: string;
  fieldName: string;
  fieldParent: string;
  sourceLink: string;
  
}
