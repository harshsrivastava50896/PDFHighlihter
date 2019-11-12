import { Component, OnInit, Pipe } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormGroup, FormBuilder, FormArray, FormControl } from "@angular/forms";
import { of } from "rxjs";
import { saveAs } from "file-saver";
import * as mammoth from "mammoth/mammoth.browser.js";
//import { mammoth } from "../../../node_modules/mammoth/mammoth.browser.js"

// declare var mammoth: any;
//var mammoth = require("mammoth");
@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"]
})
export class UserComponent implements OnInit {
  template: any[];
  form: FormGroup;
  ordersData: any[];
  spinner = true;
  templatemodel: postTemplateModel = new postTemplateModel();
  processsingData: boolean = false;
  loaderMessage="Loading Templates"
  showTemplates : boolean = false;
  templateName : string="";
  checked: boolean = false;
  selectedOrderIdss:any;
  searchText : "";
  
  constructor(
    private httpClient: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.processsingData = true;
    this.form = this.formBuilder.group({
      orders: new FormArray([])
    });
    this.sendGetRequest().subscribe((data: any[]) => {
      console.log(data);
      this.ordersData = data;
     
      this.processsingData = false;
      this.showTemplates= true;
    });
    this.spinner = false;

   
  }

  ngOnInit() {}

  
 

  sendGetRequest() {
    return this.httpClient.get(
      "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getTemplateDetails"
    );
  }

  submit() {
    this.showTemplates = false;
    this.loaderMessage = "Downloading Merged Document.....";
    this.processsingData = true;
    let selectedOrderIds = this.form.value.orders
      .map((v, i) => (v ? this.ordersData[i].TemplateId : null))
      .filter(v => v !== null);
      selectedOrderIds = this.selectedOrderIdss;
    var template  = this.ordersData.filter(x => x.TemplateId == selectedOrderIds);
    this.templateName = template[0].TemplateName;
    console.log(selectedOrderIds);
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append("Content-Type", "application/octect-stream");
    headers = headers.append("ResponseType", "application/json");
    headers.append(
      "Access-Control-Allow-Headers",
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key"
    );
    headers.append("Access-Control-Allow-Origin", "http://localhost:4200");
    headers.append(
      "Access-Control-Allow-Methods",
      "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    );
    let headersTemplate: HttpHeaders = new HttpHeaders();
    headersTemplate.append(
      "Access-Control-Allow-Headers",
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key"
    );
    headersTemplate.append(
      "Access-Control-Allow-Origin",
      "http://localhost:4200"
    );
    headersTemplate.append(
      "Access-Control-Allow-Methods",
      "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    );

 
    var krunalTemplateID = selectedOrderIds;
    var url =
      "https://uo07tg7tf3.execute-api.us-east-1.amazonaws.com/test/mailmerge?id=" +
      krunalTemplateID;


    this.httpClient
      .post<any>(url, null, { headers: headersTemplate })
      .subscribe((response: any) => {
        console.log("response", response);
        //   this.templatemodel.TemplateId = response;
        // this.templatemodel.Type = "Docx";
        this.httpClient
          .post<any>(
            "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/download",
            {
              TemplateId: response,
              Type: "FinalDocx"
            },
            { headers: headers }
          )
          .subscribe((response: any) => {
            console.log("response", response.data);
            var bytes = new Uint8Array(response.data);
            var blob = new Blob([bytes], { type: "application/octet-stream" });
            saveAs(blob, this.templateName+"_Mergerd.docx");
            console.log(bytes);
            mammoth
              .convertToHtml({ arrayBuffer: bytes })
              .then(result => {
                let html = result.value;
                let messages = result.messages;
                document.getElementById("contentdevere").innerHTML = html;
              })
              .done();

          });
          this.showTemplates = true;
          this.processsingData = false;
      });

    
  }
  generate(sss:any){
    this.templateName = sss.TemplateName;
    this.selectedOrderIdss = sss.TemplateId;
    console.log(sss);
  }
  postRequest(body: postTemplateModel) {
    return this.httpClient.post(
      "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/download",
      body,
      { responseType: "arraybuffer" }
    );
  }
}

export class postTemplateModel {
  TemplateId: string;
  Type: string;
}
