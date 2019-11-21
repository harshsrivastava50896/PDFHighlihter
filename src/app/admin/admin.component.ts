import { Component, OnInit } from "@angular/core";
import * as Popper from "popper.js/dist/umd/popper.js";
import * as $ from "jquery";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { THIS_EXPR, ThrowStmt } from "@angular/compiler/src/output/output_ast";
import { NgxSpinnerService } from "ngx-spinner";
import { PDFDocumentProxy } from "pdfjs-dist";
import { toBase64String } from "@angular/compiler/src/output/source_map";
import { catchError, retry, retryWhen, delay, mergeMap } from "rxjs/operators";
import { Observable, throwError, of } from "rxjs";
import { MergeFieldsNames } from './../Models/MergeFieldsNames';
import { MergeFieldGeneratorService } from './../merge-field-generator.service';
import { saveAs } from "file-saver";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};
httpOptions.headers.append(
  "Host",
  "um34zvea5c.execute-api.us-east-1.amazonaws.com"
);
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private httpService: HttpClient,
    private apiService: MergeFieldGeneratorService
  ) {
    setTimeout(() => {
      this.pageCoordinates = document
        .getElementById("page1")
        .getBoundingClientRect();
      this.setpixels();
      console.log("area gage", this.pageCoordinates);
    }, 1000);


  }
  path: any;
  adminForm: FormGroup;
  myData = ["Date", "Text", "ss"];
  postDataModel: postDataModel[] = [];
  mergefieldstring: string[];
  file: any;
  filename = "";
  isPdf = false;
  data: any = "./assets/welocme_pdf.pdf";
  isDictDataLoaded = false;
  sampleDict: AreaInfo[] = [];
  sampleDictactedFields = [];
  tobase64Data: any;
  processsingData = false;
  showForm: boolean = false;
  showAddFieldForm: boolean = false;
  newMergeFieldForm: boolean = false;
  mergeFieldName: string = "";
  templateId = "";
  loaderMessage: string = "";
  confirmationButton: boolean = false;

  rect: Rectangle = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  lastMousePosition: Position = { x: 0, y: 0 };
  canvasPosition: Position = { x: 0, y: 0 };
  mousePosition: Position = { x: 0, y: 0 };
  mouseDownFlag = false;
  pagePosition: Position = { x: 0, y: 0 };
  pageCoordinates: any = {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    top: 0,
    left: 0,
    right: 0
  };
  cnv;
  pdfBody;
  ctx;
  element = null;
  dataPageNumber: number;

  areaInfoInPixels: AreaInfo[] = [];
  onPageResize: number;
  onPageLoad: number;
  // added new div with rects when pages rendered
  indexOfPage = 1;
  type_field: string[];
  radio_type: string[];
  showPopup = false;
  extractedData: postDataModel[] = [];
  listRectangleId = "";
  mergeFieldTypes: MergeFieldsNames[] = [];
  blankFieldCount: number = 0;
  displayMergeFieldNames: postDataModel[] = [];
  allApplications:any[] = [];
  showSelectPdf: boolean = true;
  mergeFieldSelection: string = "";
  indexCount: number = 1;

  showTemplates: boolean = false;
  showTemplatesToBeModified: boolean = false;
  ordersData: any[];
  showEditableTemplateData: boolean = false;
  ngOnInit() {
    this.mergefieldstring = [];
    this.type_field = [];
    this.radio_type = [];
    this.adminForm = this.formBuilder.group({
      highlightedText: ["", Validators.required],
      mergeField: ["", Validators.required],
      typeOfField: ["", Validators.required],
      radioButton: ["", Validators.required]
    });
this.apiService.getAllApplications().subscribe((appData:any) => {
  this.allApplications = appData;
})
  }
  onResize(event) {
    this.setpixels();
    const image = document.getElementById("page1");
    console.log("area info", image.getBoundingClientRect());
  }
  postData() {
    this.showForm = false;
    this.processsingData = true;
    this.loaderMessage = "Generating Template";
    console.log(this.extractedData);
    this.extractedData.forEach(x => {
      x.entityType = x.mergeFieldIdentifier;
    });

    this.httpService.post('https://localhost:44382/api/PDFUtil/AddMergeFields?docId=' + this.templateId, { MergeFields: this.displayMergeFieldNames }).subscribe((dataRecived: any) => {
      console.log('data got', dataRecived);
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/octect-stream');
      headers = headers.append('ResponseType', 'application/json');
      headers.append("Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key");
      headers.append("Access-Control-Allow-Origin", "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/"); // Remove this and add s3 URL after deploy
      headers.append("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");

      let headersForTemplate: HttpHeaders = new HttpHeaders();
      headersForTemplate.append("Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key");
      headersForTemplate.append("Access-Control-Allow-Origin", "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/"); // Remove this and add s3 URL after deploy
      headersForTemplate.append("Access-Control-Allow-Methods", "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT");
      this.httpService.post('https://s7qljl48a0.execute-api.us-east-1.amazonaws.com/test/generatetemplate?id=' + this.templateId, null, { headers: headersForTemplate }).subscribe(dataRecived => {

        this.httpService.post<any>('https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/download', {
          "TemplateId": this.templateId,
          "Type": "TemplateDocx"
        }, { headers: headers, }).subscribe((response: any) => {
          this.loaderMessage = "Downloading Template....";
          console.log('response', response.data);
          const bytes = new Uint8Array(response.data);
          var blob = new Blob([bytes], { type: 'application/octet-stream' });
          saveAs(blob, this.filename + "_template.docx");
          this.processsingData = false;
          this.confirmationButton = true;
          this.showSelectPdf = false;
          this.showEditableTemplateData = false;
        })
      })

    })
  }
  fieldtype(event) {
    let Event = event.target.value;
    for (let i = 0; i < this.extractedData.length; i++) {
      if (Event != null) {
        this.type_field.push(Event);
      }
      Event = null;
    }
    console.log(this.type_field);
  }
  radiotype(event) {
    let Event = event.target.value;
    for (let i = 0; i < this.extractedData.length; i++) {
      if (Event != null) {
        this.radio_type.push(Event);
      }

      Event = null;
    }
    console.log(this.radio_type);
  }
  setpixels() {
    this.sampleDict.forEach(x => {
      let areaCooradinate: AreaInfo = new AreaInfo();
      areaCooradinate.rect.height = x.rect.height * this.pageCoordinates.height;
      areaCooradinate.rect.width = x.rect.width * this.pageCoordinates.width;
      areaCooradinate.rect.x1 = x.rect.x1 * this.pageCoordinates.width;
      areaCooradinate.rect.x2 = x.rect.x2 * this.pageCoordinates.width;
      areaCooradinate.rect.y1 = x.rect.y1 * this.pageCoordinates.height;
      areaCooradinate.rect.y2 = x.rect.y2 * this.pageCoordinates.height;
      areaCooradinate.pageNumber = x.pageNumber;
      areaCooradinate.Text = x.Text;
      areaCooradinate.Id = x.Id;
      areaCooradinate.rectangleId = x.Id;
      areaCooradinate.distance = x.distance;
      this.areaInfoInPixels.push(areaCooradinate);
    });

    console.log("Area Info in pixels", this.areaInfoInPixels);
    console.log("extracted text", this.extractedData);
  }
  verifyTemplate() {
    this.confirmationButton = false;
    this.loaderMessage = "Merging Document....";
    this.processsingData = true;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append("Content-Type", "application/octect-stream");
    headers = headers.append("ResponseType", "application/json");
    headers.append(
      "Access-Control-Allow-Headers",
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key"
    );
    headers.append("Access-Control-Allow-Origin", "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/");
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
      "http://techtalk-lfg-demo.s3-website-us-east-1.amazonaws.com/"
    );
    headersTemplate.append(
      "Access-Control-Allow-Methods",
      "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    );
    var url =
      "https://uo07tg7tf3.execute-api.us-east-1.amazonaws.com/test/mailmerge?id=" +
      this.templateId;
    this.httpService
      .post<any>(url, null, { headers: headersTemplate })
      .subscribe((response: any) => {
        this.loaderMessage = "Downloading Merged Document...."
        this.httpService
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
            saveAs(blob, this.filename + "_Mergerd.docx");
          });
        this.processsingData = false;
        this.showSelectPdf = true;
        this.data = "./assets/welocme_pdf.pdf"
      });
  }
  mouseEvent(event) {
    if (!this.showPopup) {
      if (event.type === "mousemove") {
        this.mousePosition = {
          x: event.clientX - this.pagePosition.x,
          y: event.clientY - this.pagePosition.y
        };

        if (this.mouseDownFlag) {
          const width = this.mousePosition.x - this.lastMousePosition.x;
          const height = this.mousePosition.y - this.lastMousePosition.y;
          this.rect = {
            x1: this.lastMousePosition.x,
            y1: this.lastMousePosition.y,
            x2: this.mousePosition.x,
            y2: this.mousePosition.y,
            width: width,
            height: height
          };

          if (this.element != null) {
            this.element.style.width = width + "px";
            this.element.style.height = height + "px";
            if (this.rect.width > 0 && this.rect.height > 0) {
              document
                .getElementsByClassName("to-draw-rectangle")
              [this.dataPageNumber - 1].appendChild(this.element);
            }
          }
        }
      }

      if (event.type === "mousedown") {
        this.mouseDownFlag = true;
        const path = this.composedPath(event.target);
        const eventPath = path.find(p => p.className == "page");

        if (typeof eventPath !== "undefined") {
          this.dataPageNumber = parseInt(
            eventPath.getAttribute("data-page-number")
          ); // get id of page
          const toDrawRectangle = document.getElementsByClassName(
            "to-draw-rectangle"
          );
          const pageOffset = toDrawRectangle[
            this.dataPageNumber - 1
          ].getBoundingClientRect();
          this.pagePosition = {
            x: pageOffset.left,
            y: pageOffset.top
          };

          this.lastMousePosition = {
            x: event.clientX - this.pagePosition.x,
            y: event.clientY - this.pagePosition.y
          };

          const rectId = this.indexCount++;

          this.element = document.createElement("div");
          this.element.className = "rectangle";
          this.element.id = "rectangle-" + rectId;
          this.element.style.position = "absolute";
          this.element.style.border = "2px solid #0084FF";
          this.element.style.borderRadius = "3px";
          this.element.style.left = this.lastMousePosition.x + "px";
          this.element.style.top = this.lastMousePosition.y + "px";

        }
      }

      if (event.type === "mouseup") {
        this.mouseDownFlag = false;

        if (this.rect.height > 0 && this.rect.width > 0) {
          const popper = document.querySelector(".js-popper");
          new Popper(this.element, popper, {
            placement: "top-end"
          });
          this.showPopup = true;
        }
      }
    }
  }
  pageRendered(event) {
    const elem = document.createElement("div");
    elem.className = "to-draw-rectangle";
    elem.style.position = "absolute";
    elem.style.left = 0 + "px";
    elem.style.top = 0 + "px";
    elem.style.right = 0 + "px";
    elem.style.bottom = 0 + "px";
    elem.style.cursor = "crosshair";
    this.path = this.composedPath(event.target);

    this.path.find(p => p.className == "page").appendChild(elem);

    $(".textLayer").addClass("disable-textLayer");

    if (this.isDictDataLoaded) {
      this.sampleDictactedFields.forEach(x => {
        console.log('names', x.text);

        this.areaInfoInPixels.forEach((element, index) => {
          if (element.pageNumber == this.indexOfPage && x.text.split(" ").length > 1) {
            let words = x.text.split(" ");
            let concatedReactangle: Rectangle = new Rectangle();
            if (element.Text.includes(words[0])) {
              if (index > 1 && this.areaInfoInPixels[index - 1].Text.includes(words[1])) {
                concatedReactangle.x1 = this.areaInfoInPixels[index - 1].rect.x1;
                concatedReactangle.x2 = this.areaInfoInPixels[index].rect.x2;
                concatedReactangle.y1 = this.areaInfoInPixels[index - 1].rect.y1;
                concatedReactangle.y2 = this.areaInfoInPixels[index].rect.y2;
                concatedReactangle.width = concatedReactangle.x2 - concatedReactangle.x1;
                concatedReactangle.height = concatedReactangle.y2 - concatedReactangle.y1;
              }
              if (index < this.areaInfoInPixels.length - 1 && this.areaInfoInPixels[index + 1].Text.includes(words[1])) {
                concatedReactangle.x1 = this.areaInfoInPixels[index].rect.x1;
                concatedReactangle.x2 = this.areaInfoInPixels[index + 1].rect.x2;
                concatedReactangle.y1 = this.areaInfoInPixels[index].rect.y1;
                concatedReactangle.y2 = this.areaInfoInPixels[index + 1].rect.y2;
                concatedReactangle.width = concatedReactangle.x2 - concatedReactangle.x1;
                concatedReactangle.height = concatedReactangle.y2 - concatedReactangle.y1;
              }
            }

            if (concatedReactangle.width > 0 && concatedReactangle.height > 0) {
              const rectId =
                document.getElementsByClassName("rectangle").length + 1;
              const rect = document.createElement("div");
              rect.className = "rectangle";
              rect.id = element.Id;
              rect.style.position = "absolute";
              rect.style.border = "2px solid #0084FF";
              rect.style.borderRadius = "3px";
              rect.style.left = concatedReactangle.x1 + "px";
              rect.style.top = concatedReactangle.y1 + "px";
              rect.style.width = concatedReactangle.width + "px";
              rect.style.height = concatedReactangle.height + "px";
              rect.style.cursor = "pointer";
              this.path
                .find(p => p.className == "page")
                .children[2].appendChild(rect);
              this.extractedData.push(new postDataModel(element.Id, concatedReactangle.x1, concatedReactangle.x2, concatedReactangle.y1, concatedReactangle.y2, this.pageCoordinates.height,
                this.pageCoordinates.width, x.text, x.label, "", false, x.label));
            }
          }
          else if (element.pageNumber == this.indexOfPage && (element.Text.includes(x.text))) {
            if (element.pageNumber == this.indexOfPage) {
              if (typeof element !== undefined) {
                const rect = document.createElement("div");
                rect.className = "rectangle";
                rect.id = element.Id;
                rect.style.position = "absolute";
                rect.style.border = "2px solid #0084FF";
                rect.style.borderRadius = "3px";
                rect.style.left = element.rect.x1 + "px";
                rect.style.top = element.rect.y1 + "px";
                rect.style.width = element.rect.width + "px";
                rect.style.height = element.rect.height + "px";
                rect.style.cursor = "pointer";
                // get to-draw-rectangle div and add rectangle
                this.path
                  .find(p => p.className == "page")
                  .children[2].appendChild(rect);
                this.extractedData.push(new postDataModel(element.Id, element.rect.x1, element.rect.x2, element.rect.y1, element.rect.y2, this.pageCoordinates.height,
                  this.pageCoordinates.width, element.Text, x.label, "", false, x.label));

              }
            }
          }

        });

      });
      this.extractedData.forEach((item) => {
        var i = this.displayMergeFieldNames.findIndex(x => x.mergeFieldText == item.mergeFieldText);
        if (i <= -1) {
          this.displayMergeFieldNames.push(item);
        }
      });
      this.indexOfPage++;
    }

  }

  composedPath(el) {
    const path = [];
    while (el) {
      path.push(el);
      if (el.tagName === "HTML") {
        path.push(document);
        path.push(window);
        return path;
      }
      el = el.parentElement;
    }
  }
  getStyle() {
    if (this.showPopup) {
      return "block";
    } else {
      return "none";
    }
  }

  save() {

    var concatTedFields = "";
    this.areaInfoInPixels.forEach(x => {
      if (this.findRect(x, this.rect)) {
        console.log('Threshold', this.rect);
        console.log('word coordinates', x);
        console.log(x.Text)
        concatTedFields = concatTedFields + " " + x.Text
      }
    })
    if (concatTedFields == "") {
      this.displayMergeFieldNames.push(new postDataModel(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, 'BlankField_' + this.blankFieldCount.toString(), this.mergeFieldSelection, "", true, ""));
      this.blankFieldCount++;
    }
    else { this.displayMergeFieldNames.push(new postDataModel(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, concatTedFields, this.mergeFieldSelection, "", false, "")); }

    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  cancel() {
    const rectId = this.element.getAttribute("id");
    $("#" + rectId).remove();
    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  delete(dataFiled: postDataModel) {
    var toDeleteItems: any = this.extractedData.filter(function (val) { return val.mergeFieldText == dataFiled.mergeFieldText });
    setTimeout(() => {
      toDeleteItems.forEach(x => { document.getElementById(x.id).remove() });
    }, 1000);
    this.displayMergeFieldNames = this.displayMergeFieldNames.filter(function (val) { return val.mergeFieldText != dataFiled.mergeFieldText });
    this.extractedData = this.displayMergeFieldNames;
  }
  moveTo(list: string) {
    if (this.listRectangleId != "") {
      if (document.getElementById(this.listRectangleId)) {
        document.getElementById(this.listRectangleId).style.background =
          "transparent";
        document.getElementById(this.listRectangleId).style.opacity = "1";
      }
    }
    if (this.listRectangleId !== list) {
      document
        .getElementById(list)
        .scrollIntoView({
          behavior: "smooth", block: 'center',
          inline: 'center'
        });
      document.getElementById(list).style.background = "red";
      document.getElementById(list).style.opacity = "0.4";
      this.listRectangleId = list;
    }
  }

  public onFileChange(event: any) {

    //Reiniitalize Area
    this.data = "./assets/welocme_pdf.pdf";
    this.displayMergeFieldNames = [];
    this.areaInfoInPixels = [];
    this.sampleDict = [];
    this.extractedData = [];



    this.showForm = false;
    this.loaderMessage = "Processing Data";
    this.processsingData = true;
    this.file = null;
    const files: File[] = event.target.files;
    if (files.length > 0) {
      this.file = files[0];
      this.filename = this.file.name;
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        reader.readAsArrayBuffer(this.file);
        reader.onload = (e: any) => {
          this.tobase64Data = this.arrayBufferToBase64(reader.result);
          this.loaderMessage = "Uploading Document.."
          this.httpService
            .post(
              "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/upload",
              { data: this.tobase64Data, filePath: this.filename },
              httpOptions
            )
            .subscribe((response: any) => {
              this.templateId = response.TemplateId
              setTimeout(() => {
                this.apiService
                  .getDictionaryDetails(response.TemplateId).pipe(this.delayedRetry(10000, 8))
                  .subscribe((conversion: any) => {
                    console.log("dict ---->", conversion);
                    this.sampleDict = conversion.data;
                    setTimeout(() => {
                    }, 2000);
                    this.setpixels();
                    this.loaderMessage = "Analyzing Document..."
                    this.httpService
                      .get(
                        "https://y6hl1i714a.execute-api.us-east-1.amazonaws.com/test/ML?id=" +
                        response.TemplateId
                      ).pipe(this.delayedRetry(5000, 8))
                      .subscribe((pythonResponse: any[]) => {
                        this.sampleDictactedFields = pythonResponse
                        setTimeout(() => {
                        }, 2000);
                        if (this.file.type === "application/pdf") {
                          this.isPdf = true;
                          this.data = new Uint8Array(e.target.result);
                          this.isDictDataLoaded = true;
                          this.processsingData = false;
                          this.showForm = true;
                        } else {
                          this.isPdf = false;
                        }
                        error => { this.processsingData = false; console.log('oops', error) }
                      });

                  });
              }, 40000);
            });
        };
      }
    }
  }
  arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  delayedRetry(delayMs: number, maxRetry = 5) {
    let retries = maxRetry;
    return (src: Observable<any>) => src.pipe(retryWhen((errors: Observable<any>) => errors.pipe(
      delay(delayMs), mergeMap(error => retries-- > 0 ? of(error) : throwError('giving up'))
    )))
  }

  FieldInit(identifier: string) {
    if (identifier === "Buyer")
      return 'BuyerName';
    if (identifier === "Seller")
      return 'SellerName';

  }

  findRect(word: AreaInfo, threshold: Rectangle) {
    if ((word.rect.x1 + word.rect.width) < (threshold.x1 + threshold.width)
      && (word.rect.x1) > (threshold.x1)
      && (word.rect.y1) > (threshold.y1)
      && (word.rect.y1 + word.rect.height) < (threshold.y1 + threshold.height)
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  editTemplate() {
    this.showForm = true;
    this.showSelectPdf = false;
    this.confirmationButton = false;
    this.showEditableTemplateData = true;
  }

  showExistingTemplates() {
    this.showTemplates = !this.showTemplates;
    this.loaderMessage = "Fetching Templates"
    this.processsingData = true;
    this.httpService.get(
      "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/dynamodbactivity/getTemplateDetails"
    ).subscribe((data: any[]) => {
      console.log(data);
      this.ordersData = data;
      this.showTemplatesToBeModified = true;
      this.processsingData = false;
    });
  }
  backToMainSection() {
    this.showTemplates = !this.showTemplates;
  }
  getPDF(pdfData: any) {
    this.templateId = pdfData.TemplateId;
    this.apiService.getPdfDetails(pdfData.TemplateId, pdfData.TemplateName).pipe(retry(5)).subscribe((response: any) => {
      console.log(response.pdfData);
      console.log('template fields', response.TemplateParameter);
      this.data = this.convertDataURIToBinary(response.pdfData);
      this.apiService
        .getDictionaryDetails(pdfData.TemplateId).subscribe(dict => {
          this.sampleDict = dict.data;
          setTimeout(() => {
          }, 2000);
          this.setpixels();
        });
      this.showTemplatesToBeModified = false;
      this.processsingData = true;
      this.loaderMessage = "Fetching Template Details ....";
      setTimeout(() => {

        response.TemplateParameter.MergeFields.forEach(x => {
          this.sampleDict.forEach(item => {
            if (item.Text == x.mergeFieldText) {
              const rect = document.createElement("div");
              rect.className = "rectangle";
              rect.id = item.Id;
              rect.style.position = "absolute";
              rect.style.border = "2px solid #0084FF";
              rect.style.borderRadius = "3px";
              rect.style.left = (item.rect.x1 * this.pageCoordinates.width) + "px";
              rect.style.top = (item.rect.y1 * this.pageCoordinates.height) + "px";
              rect.style.width = (item.rect.width * this.pageCoordinates.width) + "px";
              rect.style.height = (item.rect.height * this.pageCoordinates.height) + "px";
              rect.style.cursor = "pointer";
              this.path
                .find(p => p.className == "page")
                .children[2].appendChild(rect);
              x.id = item.Id;
              this.extractedData.push(x);
            }
          })
          this.displayMergeFieldNames.push(x);
        })
        this.processsingData = false;
        this.showEditableTemplateData = true;
      }, 5000);
    })

  }

  convertDataURIToBinary(base64: any) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  changeProject(event : any) {
    if(event !== undefined) {
      this.apiService.getMergeFieldsNames(event).subscribe(fields => {
        this.mergeFieldTypes = fields;
      })
    }
  }
  addExtraMergeField() {
    this.displayMergeFieldNames.push(new postDataModel("rectangle-"+this.indexCount++, 0,0, 0,0, this.pageCoordinates.height, this.pageCoordinates.width, "", "", "", true, ""));

  }
}

class Position {
  x: number;
  y: number;
}

class Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

class AreaInfo {
  rectangleId: string;
  pageNumber: number;
  rect: Rectangle = new Rectangle();
  isDelete?: boolean;
  Text?: string;
  distance: number;
  Id?: string;
}
class PagePixels {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}


class postDataModel {
  id = "";
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  height: number;
  width: number;
  mergeFieldText: string;
  mergeFieldIdentifier: string;
  value: string;
  isBlankField: boolean;
  entityType: string;

  constructor(
    id = "",
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    height: number,
    width: number,
    mergeFieldText: string,
    mergeFieldIdentifier: string,
    value: string = "",
    isBlankField: boolean = false,
    entityType: string) {
    this.id = id;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.height = height;
    this.width = width;
    this.mergeFieldText = mergeFieldText;
    this.mergeFieldIdentifier = mergeFieldIdentifier;
    this.value = value;
    this.isBlankField = isBlankField;
    this.entityType = entityType
  }


}


