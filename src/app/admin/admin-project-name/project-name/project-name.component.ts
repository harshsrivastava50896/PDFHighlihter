import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-project-name',
  templateUrl: './project-name.component.html',
  styleUrls: ['./project-name.component.scss']
})
export class ProjectNameComponent implements OnInit {
  List: any[] = ['Hello', 'Brother', 'Michael'];
  private fieldArray: Array<any> = [];
  public projects = [];
  urlSource: any;
  userDetails: any;
  projectName: string;
  dataLoaded: boolean = false;
  addProj: boolean = false;
  newProjectAdditon: boolean = false;
  currentApplication: boolean = false;
  newProjectForm: boolean = false;
  showAddProjectButton: boolean = true;
  userDataLoaded: boolean = false;
  projectModel: ProjectModel[];
  public s: string = "Hello";
  public dataSource: string;
  a: any;
  finalModel:any = [];
  filteredDetails:any = [];
  currentApplicationDetails = [];
  private newAttribute: any = {};
  urlGetAllApplications: string = 'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getAllApplications';
  urlFetchDetails: string = '';
  constructor(private http: HttpClient) {
    this.projectModel = [];
    this.http.get(this.urlGetAllApplications).subscribe((x: []) => {
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
  addProject() {
    this.addProj = true;
    this.newProjectAdditon = true;
    this.showAddProjectButton = false;
  }
  cancelNewProjectAddition() {
    this.addProj = false;
    this.newProjectAdditon = false;
    this.showAddProjectButton = true;

  }
  getCurrentApplication(index) {
    this.currentApplication = true;
    var url = 'https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getSourceDynamodbDetails?Application=' + this.projects[index];
    this.http.get(url).subscribe((x: []) => {
      console.log(x);
      this.currentApplicationDetails = x;
    })

  }
  cancelProject() {
    this.currentApplication = false;
    this.addProj = false;
  }

  getevent(event) {
    console.log(event);
    this.getCurrentApplication(event);
  }
  fetchUserDetails() {
    // var b = [{
    //   "dataSourceName": "BuyerAddress",
    //   "dataSourceValue": "Seattle, Washington"
    // },
    // {
    //   "dataSourceName": "SellerName",
    //   "dataSourceValue": "sdssafdasdsdad"
    // },

    // {
    //   "dataSourceName": "SellerAddress",
    //   "dataSourceValue": "Chicago, Illinoi"
    // },
    // {
    //   "dataSourceName": "SellerPhone",
    //   "dataSourceValue": "55555588558"
    // },
    // {
    //   "dataSourceName": "BuyerName",
    //   "dataSourceValue": "Joe Diep"
    // },
    // {
    //   "dataSourceName": "BuyerPhone",
    //   "dataSourceValue": "4444444444"
    // }


    // ]
    this.fetchDetails();
    this.userDataLoaded = true;
    this.http.get(this.dataSource).subscribe((x: any) => {
      console.log(x);
      this.userDetails = x;
      this.projectModel.forEach(d => {
        this.a = this.userDetails.filter(x => x.dataSourceName == d.AttributeName);
        this.a.forEach(data => {
          this.filteredDetails.push(data);
        })
       

        
      });
      console.log(this.filteredDetails);
      
      

     

    });
  
   
    
  }
  fetchDetails() {

    let headers: HttpHeaders = new HttpHeaders();

    headers.append("Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key");
    headers.append("Access-Control-Allow-Origin", "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/"); // Remove this and add s3 URL after deploy
    headers.append("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");
    //this.urlFetchDetails = this.urlFetchDetails.toLowerCase();
    console.log(this.urlFetchDetails);
    this.dataLoaded = true;
    this.http.get(this.urlFetchDetails, { headers: headers }).subscribe((model: any) => {
      console.log(model);
      this.projectModel = model.SourceDetail;
    });
  }

  addExtraFields() {
    this.projectModel.push(new ProjectModel(this.projectName, "", "", "id", ""));
  }
  submitProjectDetails() {
    this.projectModel.forEach(field => {
      field.AttributeName = field.FieldName;
      field.Application = this.projectName;
    })
    this.http.post('https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/updateSourceDynamodbDetails', this.projectModel).subscribe(x => {
      window.alert('Data Submitted Succesfully');
      this.addProj = false;
      error => {
        window.alert('Error Occured');
      }
    })
  }
}
class ProjectModel {
  constructor($applicationName: string, $attributeName: string, $fieldName: string, $fieldParent: string, $sourceLink: string) {
    this.Application = $applicationName;
    this.AttributeName = $attributeName;
    this.FieldName = $fieldName;
    this.FieldParent = $fieldParent;
    this.SourceLink = $sourceLink;

  }
  Application: string;
  AttributeName: string;
  FieldName: string;
  FieldParent: string;
  SourceLink: string;

}
