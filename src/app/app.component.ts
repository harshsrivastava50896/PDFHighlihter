import { Component } from "@angular/core";
import * as Popper from "popper.js/dist/umd/popper.js";
import * as $ from "jquery";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { THIS_EXPR, ThrowStmt } from "@angular/compiler/src/output/output_ast";
import * as json from "../assets/sample3.json";
import { NgxSpinnerService } from "ngx-spinner";
import { PDFDocumentProxy } from "pdfjs-dist";
import { toBase64String } from "@angular/compiler/src/output/source_map";
import { catchError, retry } from "rxjs/operators";
import { Observable } from "rxjs";
import { MergeFieldGeneratorService } from "./merge-field-generator.service.js";
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
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
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
  adminForm: FormGroup;
  myData = ["Date", "Text", "ss"];
  postDataModel: postDataModel[] = [];
  mergefieldstring: string[];

  file: any;
  filename = "";
  isPdf = false;
  data: any = "./assets/welocme_pdf.pdf";
  isDictDataLoaded = false;
  sampleDict: AreaInfo[] = json["default"];
  sampleDictactedFields = ["Seller", "Buyer"];
  tobase64Data: any;
  processsingData = false;
  showForm: boolean = false;
  showAddFieldForm: boolean = false;
  newMergeFieldForm: boolean = false;
  mergeFieldName: string = "";

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

  areaInfo: AreaInfo[] = [];
  areaInfoInPixels: AreaInfo[] = [];
  highlightedTextFields: AreaInfo[] = [];
  onPageResize: number;
  onPageLoad: number;
  // added new div with rects when pages rendered
  indexOfPage = 1;
  type_field: string[];
  radio_type: string[];
  showPopup = false;
  extractedData: string[] = [];
  listRectangleId = "";

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
  }
  onResize(event) {
    this.setpixels();
    const image = document.getElementById("page1");
    console.log("area info", image.getBoundingClientRect());
  }
  postData() {
    // model.highlighted_text = null;
    // model.merged_field

    console.log(this.mergefieldstring);
    for (let i = 0; i < this.mergefieldstring.length; i++) {
      const model: postDataModel = new postDataModel();
      model.highlighted_text = this.extractedData[i];
      model.merged_field = this.mergefieldstring[i];
      model.raidof_ield = this.radio_type[i];
      model.type_of_field = this.type_field[i];
      this.postDataModel.push(model);
    }
    console.log(this.postDataModel);
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
    this.areaInfoInPixels = [] = [];
    this.sampleDict.forEach(x => {
      const areaCooradinate: AreaInfo = new AreaInfo();
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
      this.areaInfoInPixels.push(areaCooradinate);
    });
    
    console.log("Area Info in pixels", this.areaInfoInPixels);
    console.log("extracted text", this.extractedData);
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

          const rectId =
            document.getElementsByClassName("rectangle").length + 1;
          this.element = document.createElement("div");
          this.element.className = "rectangle";
          this.element.id = "rectangle-" + rectId;
          this.element.style.position = "absolute";
          this.element.style.border = "2px solid #0084FF";
          this.element.style.borderRadius = "3px";
          this.element.style.left = this.lastMousePosition.x + "px";
          this.element.style.top = this.lastMousePosition.y + "px";
          console.log("elemenet coordinates", this.element);
          console.log("last mouse position", this.lastMousePosition);
          console.log("initial mouse", this.mousePosition);
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
    const path = this.composedPath(event.target);

    path.find(p => p.className == "page").appendChild(elem);

    $(".textLayer").addClass("disable-textLayer");

    if (this.isDictDataLoaded) {
      this.sampleDictactedFields.forEach(x => {
        this.areaInfoInPixels.forEach(element => {
          if (element.pageNumber == this.indexOfPage && element.Text == x) {
            if (element.pageNumber == this.indexOfPage) {
              if (typeof element !== undefined) {
                const rectId =
                  document.getElementsByClassName("rectangle").length + 1;
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
                path
                  .find(p => p.className == "page")
                  .children[2].appendChild(rect);
                this.highlightedTextFields.push(element);
                this.extractedData.push(element.Text);
                // console.log('upadted array', this.element);
              }
            }
          }
        });
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
    const coordinatesForDistance = {
      xc: ((this.rect.x2 + this.rect.x1)/2) / this.pageCoordinates.width,
      yc: ((this.rect.y2 + this.rect.y1)/2) / this.pageCoordinates.height
    };
    const distance =
      (coordinatesForDistance.xc - 0.5) ** 2 +
      (coordinatesForDistance.yc - 0.5) ** 2;
    console.log("coordinates in ratios", coordinatesForDistance);

    this.areaInfo.push({
      rectangleId: this.element.id,
      pageNumber: this.dataPageNumber,
      rect: this.rect,
      isDelete: false
    });
    console.log("final highleted", this.rect);

    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  cancel() {
    const rectId = this.element.getAttribute("id");
    $("#" + rectId).remove();
    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  delete(list: AreaInfo) {
    document.getElementById(list.rectangleId).remove();
    this.areaInfo.find(f => f.rectangleId === list.rectangleId).isDelete = true;
    this.areaInfo = this.areaInfo.filter(f => f.isDelete === false);
  }
  moveTo(list: AreaInfo) {
    if (this.listRectangleId != "") {
      if (document.getElementById(this.listRectangleId)) {
        document.getElementById(this.listRectangleId).style.background =
          "transparent";
        document.getElementById(this.listRectangleId).style.opacity = "1";
      }
    }
    if (this.listRectangleId !== list.rectangleId) {
      document
        .getElementById(list.rectangleId)
        .scrollIntoView({ block: "start", behavior: "smooth" });
      document.getElementById(list.rectangleId).style.background = "red";
      document.getElementById(list.rectangleId).style.opacity = "0.4";
      this.listRectangleId = list.rectangleId;
    }
  }

  public onFileChange(event: any) {
    this.processsingData = true;
    // console.log('dict ------>', this.sampleDict[0]);
    this.file = null;
    const files: File[] = event.target.files;
    if (files.length > 0) {
      this.file = files[0];
      // console.log('inital content', files);

      // console.log('file contents', this.file);

      this.filename = this.file.name;
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        const formData = new FormData();
        // formData.append('file', this.tobase64Data, this.filename);

        // reader.onloadend = (e: any) => {
        //   if (this.file.type === 'application/pdf') {
        //     this.isPdf = true;
        //     this.data = new Uint8Array(e.target.result);
        //     this.isDictDataLoaded = true;

        //   } else {
        //     this.isPdf = false;
        //   }
        //   // this.handleAttachmentsInOfflineMode();
        // };

        reader.readAsArrayBuffer(this.file);

        reader.onload = (e: any) => {
          // console.log('event', e);

          // console.log('in promise', reader.result);
          this.tobase64Data = this.arrayBufferToBase64(reader.result);
          // console.log('btoa', this.arrayBufferToBase64(reader.result));
          this.httpService
            .post(
              "https://um34zvea5c.execute-api.us-east-1.amazonaws.com/dev/s3activity/upload",
              { data: this.tobase64Data, filePath: this.filename },
              httpOptions
            )
            .subscribe((response: any) => {
              // the internal call for docx

              const headers = new HttpHeaders().set(
                "Content-Type",
                "text/plain; charset=utf-8"
              );
              this.httpService
                .get(
                  "http://fai-blr02s1136:8090/api/DocConvert/Convert?id=" +
                    response.TemplateId +
                    "/" +
                    this.filename,
                  { headers, responseType: "text" as "json" }
                )
                .subscribe(asposConvertedData => {
                  // console.log('response', asposConvertedData);
                  setTimeout(() => {
                    this.apiService
                      .getDictionaryDetails(response.TemplateId)
                      .subscribe((conversion: any) => {
                        console.log("dict ---->", conversion);
                        this.sampleDict = conversion.data;
                        this.setpixels();
                        // this.httpService
                        //   .get(
                        //     "https://y6hl1i714a.execute-api.us-east-1.amazonaws.com/test/ML?id=" +
                        //       response.TemplateId
                        //   )
                        //   .subscribe((pythonResponse: any) => {
                        //     console.log("python reponse", pythonResponse);
                        //   });
                        if (this.file.type === "application/pdf") {
                          this.isPdf = true;
                          this.data = new Uint8Array(e.target.result);
                          this.isDictDataLoaded = true;
                          this.processsingData = false;
                          this.showForm = true;
                        } else {
                          this.isPdf = false;
                        }
                      });
                  }, 40000);
                });
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

  addMergeField() {
    this.newMergeFieldForm = true;
  }
  addFieldToForm() {
    this.areaInfoInPixels.forEach(x => {
      if (x.Text == this.mergeFieldName) {
      }
    });
    this.extractedData.push(this.mergeFieldName);
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
  highlighted_text: string;
  type_of_field: string;
  merged_field: string;
  raidof_ield: string;
}
