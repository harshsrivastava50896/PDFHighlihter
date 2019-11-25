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
import { AdminService } from "../services/admin.service";
import { constants } from "../Utilities/app.const";
import { MergeFieldContainer } from "../Models/MergeFieldContainer";
import { Rectangle } from "../Models/Rectangle";
import { AreaInfo } from "../Models/AreaInfo";
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

  path: any;
  adminForm: FormGroup;
  file: any;
  filename: string;
  isPdf: boolean;
  data: any;
  isDictDataLoaded: boolean;
  Dictionary: AreaInfo[];
  MLMap: any;
  tobase64Data: any;
  processsingData: boolean;
  showForm: boolean;
  mergeFieldName: string;
  templateId: string;
  loaderMessage: string;
  confirmationButton: boolean;
  addExtraFieldCounter: number;

  rect: Rectangle;
  lastMousePosition: Position;
  canvasPosition: Position;
  mousePosition: Position;
  mouseDownFlag = false;
  pagePosition: Position;
  pageCoordinates: any;
  element: any;
  dataPageNumber: number;

  DictionaryInfoInPixel: AreaInfo[] = [];
  // added new div with rects when pages rendered
  indexOfPage: number;
  type_field: string[];
  radio_type: string[];
  showPopup: boolean;
  HighlightedFields: MergeFieldContainer[];
  listRectangleId;
  mergeFieldTypes: MergeFieldsNames[];
  blankFieldCount: number;
  MergeFieldsSelectedList: MergeFieldContainer[];
  allApplications: any[];
  showSelectPdf: boolean;
  mergeFieldSelection: string;
  indexCount: number;
  projectName: string;

  showTemplates: boolean = false;
  showTemplatesToBeModified: boolean = false;
  ordersData: any[];
  showEditableTemplateData: boolean = false;
  showAutoDectionButton: boolean = false;



  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private httpService: HttpClient,
    private apiService: MergeFieldGeneratorService,
    private adminService: AdminService
  ) {
    setTimeout(() => {
      this.pageCoordinates = document
        .getElementById("page1")
        .getBoundingClientRect();
      this.CalculateDictInfoInPixels();
      console.log("area gage", this.pageCoordinates);
    }, 1000);

    //Initializing
    this.filename = "";
    this.isPdf = false;
    this.data = "./assets/welocme_pdf.pdf";
    this.isDictDataLoaded = false;
    this.processsingData = false;
    this.showForm = false;
    this.mergeFieldName = "";
    this.templateId = "";
    this.loaderMessage = "";
    this.confirmationButton = false;
    this.addExtraFieldCounter = 0;
    this.Dictionary = [];
    this.MLMap = [];

    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
    this.lastMousePosition = { x: 0, y: 0 };
    this.canvasPosition = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.mouseDownFlag = false;
    this.pagePosition = { x: 0, y: 0 };
    this.pageCoordinates = {
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      bottom: 0,
      top: 0,
      left: 0,
      right: 0
    };
    this.element = null;

    this.indexOfPage = 1;
    this.showPopup = false;
    this.HighlightedFields = [];
    this.listRectangleId = "";
    this.mergeFieldTypes = [];
    this.blankFieldCount = 0;
    this.MergeFieldsSelectedList = [];
    this.allApplications = [];
    this.showSelectPdf = true;
    this.mergeFieldSelection = "";
    this.indexCount = 1;
    this.projectName = "";

    this.showTemplates = false;
    this.showTemplatesToBeModified = false;
    this.showEditableTemplateData = false;
    this.showAutoDectionButton = false;

  }

  ngOnInit() {
    this.type_field = [];
    this.radio_type = [];
    this.adminForm = this.formBuilder.group({
      highlightedText: ["", Validators.required],
      mergeField: ["", Validators.required],
      typeOfField: ["", Validators.required],
      radioButton: ["", Validators.required]
    });
    this.adminService.GetAllApplications().subscribe((appData: any) => {
      this.allApplications = appData;
    })
  }

  onResize(event) {
    this.CalculateDictInfoInPixels();
    const image = document.getElementById("page1");
  }

  /**
   * Generates template with current merge field selections
   */
  GenerateTemplate() {
    this.showForm = false;
    this.showEditableTemplateData = false;
    this.processsingData = true;
    this.loaderMessage = "Generating Template";
    this.HighlightedFields.forEach(dictWord => {
      dictWord.entityType = dictWord.mergeFieldIdentifier;
    });
    this.adminService.AddMergeFields(this.templateId, this.MergeFieldsSelectedList).pipe(this.delayedRetry(10000, 4)).subscribe((dataRecived: any) => {

      this.adminService.GenerateTemplate(this.templateId).pipe(this.delayedRetry(10000, 4)).subscribe(dataRecived => {
        this.adminService.S3Download(this.templateId, constants.S3DocType.TemplateDocx).subscribe((response: any) => {

          this.loaderMessage = "Downloading Template....";
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

  /**Convert Normalized Coordinates to Localized Pixel map of Words Dictionary*/
  CalculateDictInfoInPixels() {
    this.Dictionary.forEach(dictWord => {
      let areaCooradinate: AreaInfo = new AreaInfo();
      areaCooradinate.rect.height = dictWord.rect.height * this.pageCoordinates.height;
      areaCooradinate.rect.width = dictWord.rect.width * this.pageCoordinates.width;
      areaCooradinate.rect.x1 = dictWord.rect.x1 * this.pageCoordinates.width;
      areaCooradinate.rect.x2 = dictWord.rect.x2 * this.pageCoordinates.width;
      areaCooradinate.rect.y1 = dictWord.rect.y1 * this.pageCoordinates.height;
      areaCooradinate.rect.y2 = dictWord.rect.y2 * this.pageCoordinates.height;
      areaCooradinate.pageNumber = dictWord.pageNumber;
      areaCooradinate.Text = dictWord.Text;
      areaCooradinate.Id = dictWord.Id;
      areaCooradinate.rectangleId = dictWord.Id;
      areaCooradinate.distance = dictWord.distance;
      this.DictionaryInfoInPixel.push(areaCooradinate);
    });
  }

  /**
   * Generates the template with sample data.
   */
  verifyTemplate() {
    this.confirmationButton = false;
    this.loaderMessage = "Merging Document....";
    this.processsingData = true;
    this.adminService.MailMerge(this.templateId, this.projectName).subscribe((response: any) => {
      this.loaderMessage = "Downloading Merged Document...."
      this.adminService.S3Download(response, constants.S3DocType.FinalDocx)
        .subscribe((response: any) => {
          var bytes = new Uint8Array(response.data);
          var blob = new Blob([bytes], { type: "application/octet-stream" });
          saveAs(blob, this.filename + "_Mergerd.docx");
        });
      this.processsingData = false;
      this.showSelectPdf = true;
      this.data = "./assets/welocme_pdf.pdf"
    });
  }

  /**
   * Mouse Event binded to PDF highlighter component
   * @param event mouse events
   */
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

  /**
   * Initialize Function of PDF Viewer
   * @param event Fires event after PDF viewer has been initialized
   */
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
      this.MLMap.forEach(mlWord => {

        this.DictionaryInfoInPixel.forEach((dictInfo, index) => {
          if (dictInfo.pageNumber == this.indexOfPage && mlWord.text.split(" ").length > 1) {
            let words = mlWord.text.split(" ");
            let concatedReactangle: Rectangle = new Rectangle();
            if (dictInfo.Text.includes(words[0])) {
              if (index > 1 && this.DictionaryInfoInPixel[index - 1].Text.includes(words[1])) {
                concatedReactangle.x1 = this.DictionaryInfoInPixel[index - 1].rect.x1;
                concatedReactangle.x2 = this.DictionaryInfoInPixel[index].rect.x2;
                concatedReactangle.y1 = this.DictionaryInfoInPixel[index - 1].rect.y1;
                concatedReactangle.y2 = this.DictionaryInfoInPixel[index].rect.y2;
                concatedReactangle.width = concatedReactangle.x2 - concatedReactangle.x1;
                concatedReactangle.height = concatedReactangle.y2 - concatedReactangle.y1;
              }
              if (index < this.DictionaryInfoInPixel.length - 1 && this.DictionaryInfoInPixel[index + 1].Text.includes(words[1])) {
                concatedReactangle.x1 = this.DictionaryInfoInPixel[index].rect.x1;
                concatedReactangle.x2 = this.DictionaryInfoInPixel[index + 1].rect.x2;
                concatedReactangle.y1 = this.DictionaryInfoInPixel[index].rect.y1;
                concatedReactangle.y2 = this.DictionaryInfoInPixel[index + 1].rect.y2;
                concatedReactangle.width = concatedReactangle.x2 - concatedReactangle.x1;
                concatedReactangle.height = concatedReactangle.y2 - concatedReactangle.y1;
              }
            }

            if (concatedReactangle.width > 0 && concatedReactangle.height > 0) {
              const rectId =
                document.getElementsByClassName("rectangle").length + 1;
              const rect = document.createElement("div");
              rect.className = "rectangle";
              rect.id = dictInfo.Id;
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
              this.HighlightedFields.push(new MergeFieldContainer(dictInfo.Id, concatedReactangle.x1, concatedReactangle.x2, concatedReactangle.y1, concatedReactangle.y2, this.pageCoordinates.height,
                this.pageCoordinates.width, mlWord.text, mlWord.label, "", false, mlWord.label));
            }
          }
          else if (dictInfo.pageNumber == this.indexOfPage && (dictInfo.Text.includes(mlWord.text))) {
            if (dictInfo.pageNumber == this.indexOfPage) {
              if (typeof dictInfo !== undefined) {
                const rect = document.createElement("div");
                rect.className = "rectangle";
                rect.id = dictInfo.Id;
                rect.style.position = "absolute";
                rect.style.border = "2px solid #0084FF";
                rect.style.borderRadius = "3px";
                rect.style.left = dictInfo.rect.x1 + "px";
                rect.style.top = dictInfo.rect.y1 + "px";
                rect.style.width = dictInfo.rect.width + "px";
                rect.style.height = dictInfo.rect.height + "px";
                rect.style.cursor = "pointer";
                // get to-draw-rectangle div and add rectangle
                this.path
                  .find(p => p.className == "page")
                  .children[2].appendChild(rect);
                this.HighlightedFields.push(new MergeFieldContainer(dictInfo.Id, dictInfo.rect.x1, dictInfo.rect.x2, dictInfo.rect.y1, dictInfo.rect.y2, this.pageCoordinates.height,
                  this.pageCoordinates.width, dictInfo.Text, mlWord.label, "", false, mlWord.label));

              }
            }
          }

        });

      });
      this.HighlightedFields.forEach((highlightItem) => {
        var i = this.MergeFieldsSelectedList.findIndex(selectedItem => selectedItem.mergeFieldText == highlightItem.mergeFieldText);
        if (i <= -1) {
          this.MergeFieldsSelectedList.push(highlightItem);
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

  /**
   * displays the text under hightlighted area.
   */
  SelectText() {
    var concatTedFields = "";

    this.DictionaryInfoInPixel.forEach(dictWord => {
      if (this.findRect(dictWord, this.rect)) {
        concatTedFields = concatTedFields + " " + dictWord.Text
        if (concatTedFields) {
          concatTedFields = concatTedFields.trim();
        }
      }
    })
    if (concatTedFields == "") {
      this.MergeFieldsSelectedList.push(new MergeFieldContainer(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, 'BlankField_' + this.blankFieldCount.toString(), this.mergeFieldSelection, "", true, ""));
      this.HighlightedFields.push(new MergeFieldContainer(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, 'BlankField_' + this.blankFieldCount.toString(), this.mergeFieldSelection, "", true, ""));

      this.blankFieldCount++;
    }
    else {
      this.MergeFieldsSelectedList.push(new MergeFieldContainer(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, concatTedFields, this.mergeFieldSelection, "", false, ""));
      this.HighlightedFields.push(new MergeFieldContainer(this.element.id, this.rect.x1, this.rect.x2, this.rect.y1, this.rect.y2, this.pageCoordinates.height, this.pageCoordinates.width, concatTedFields, this.mergeFieldSelection, "", false, ""));

    }

    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  CancelSelection() {
    const rectId = this.element.getAttribute("id");
    $("#" + rectId).remove();
    this.showPopup = false;
    this.rect = { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  }

  delete(dataFiled: MergeFieldContainer) {
    var toDeleteItems: any = this.HighlightedFields.filter(function (val) { return val.mergeFieldText == dataFiled.mergeFieldText });
    setTimeout(() => {
      toDeleteItems.forEach(item => {
        setTimeout(() => {
          document.getElementById(item.id).remove()
        }, 100);

      });
    }, 1000);
    this.MergeFieldsSelectedList = this.MergeFieldsSelectedList.filter(function (val) { return val.mergeFieldText != dataFiled.mergeFieldText });
    this.HighlightedFields = Object.assign([], this.MergeFieldsSelectedList);
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
    this.MergeFieldsSelectedList = [];
    this.DictionaryInfoInPixel = [];
    this.Dictionary = [];
    this.HighlightedFields = [];



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
          this.adminService.S3Upload(this.tobase64Data, this.filename)
            .subscribe((response: any) => {
              this.templateId = response.TemplateId;
              if (this.file.type === "application/pdf") {
                this.isPdf = true;
                this.data = new Uint8Array(e.target.result);
                this.isDictDataLoaded = true;
                this.processsingData = false;
                this.showForm = true;
              } else {
                this.isPdf = false;
              }
              setTimeout(() => {

                this.adminService.S3Download(response.TemplateId, constants.S3DocType.Dictionary).pipe(this.delayedRetry(10000, 8))
                  .subscribe((conversion: any) => {
                    this.Dictionary = conversion.data;
                    setTimeout(() => {
                    }, 2000);
                    this.CalculateDictInfoInPixels();
                    this.loaderMessage = "Analyzing Document..."
                    this.adminService.GenerateMLMap(response.TemplateId).pipe(this.delayedRetry(5000, 8))
                      .subscribe((pythonResponse: any[]) => {
                        this.MLMap = pythonResponse
                        this.showAutoDectionButton = true;
                        setTimeout(() => {
                        }, 2000);
                        error => { this.processsingData = false; console.log('oops', error) }
                      });

                  });
              }, 4000);
            });
        };
      }
    }
  }
  runMlModel() {
    this.MLMap.forEach(mlWord => {
      if (mlWord.text.split(" ").length > 1) {
        let words = mlWord.text.split(" ");
        let lenOfWords = words.length;
        let concatedReactangle: Rectangle = new Rectangle();
        let id = "";
        this.DictionaryInfoInPixel.forEach((dictWord, index) => {
          if ((index + lenOfWords - 1 < this.DictionaryInfoInPixel.length) && mlWord.text.includes(dictWord.Text) && (this.DictionaryInfoInPixel[index + lenOfWords - 1].Text.includes(words[lenOfWords - 1]))) {
            // console.log("Inside if block", index, lenOfWords, words);
            concatedReactangle.x1 = this.DictionaryInfoInPixel[index].rect.x1;
            concatedReactangle.x2 = this.DictionaryInfoInPixel[index + lenOfWords - 1].rect.x2;
            concatedReactangle.y1 = this.DictionaryInfoInPixel[index].rect.y1;
            concatedReactangle.y2 = this.DictionaryInfoInPixel[index + lenOfWords - 1].rect.y2;
            concatedReactangle.width = concatedReactangle.x2 - concatedReactangle.x1;
            concatedReactangle.height = concatedReactangle.y2 - concatedReactangle.y1;
            const rect = document.createElement("div");
            rect.className = "rectangle";
            rect.id = dictWord.Id;
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
            this.HighlightedFields.push(new MergeFieldContainer(dictWord.Id, concatedReactangle.x1, concatedReactangle.x2, concatedReactangle.y1, concatedReactangle.y2, this.pageCoordinates.height,
              this.pageCoordinates.width, mlWord.text, mlWord.label, "", false, mlWord.label));
          }


        })

      }
      else {
        this.DictionaryInfoInPixel.forEach(dictInfo => {
          if (dictInfo.Text.includes(mlWord.text)) {
            if (typeof dictInfo !== undefined) {
              // console.log("indicated text:", dictInfo.Text);
              const rect = document.createElement("div");
              rect.className = "rectangle";
              rect.id = dictInfo.Id;
              rect.style.position = "absolute";
              rect.style.border = "2px solid #0084FF";
              rect.style.borderRadius = "3px";
              rect.style.left = dictInfo.rect.x1 + "px";
              rect.style.top = dictInfo.rect.y1 + "px";
              rect.style.width = dictInfo.rect.width + "px";
              rect.style.height = dictInfo.rect.height + "px";
              rect.style.cursor = "pointer";
              // get to-draw-rectangle div and add rectangle
              this.path
                .find(p => p.className == "page")
                .children[2].appendChild(rect);
              this.HighlightedFields.push(new MergeFieldContainer(dictInfo.Id, dictInfo.rect.x1, dictInfo.rect.x2, dictInfo.rect.y1, dictInfo.rect.y2, this.pageCoordinates.height,
                this.pageCoordinates.width, dictInfo.Text, mlWord.label, "", false, mlWord.label));
              // console.log('adding highlight field', this.HighlightedFields);

            }

          }
        });


      }
    });
    this.HighlightedFields.forEach((highlightedItem) => {
      var i = this.MergeFieldsSelectedList.findIndex(selectedListItem => selectedListItem.mergeFieldText == highlightedItem.mergeFieldText);
      if (i <= -1) {
        this.MergeFieldsSelectedList.push(highlightedItem);
      }
    });
    this.showAutoDectionButton = false;
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
    this.loaderMessage = "Fetching Templates"
    this.processsingData = true;
    this.DictionaryInfoInPixel = Object.assign([], null);
    this.Dictionary = Object.assign([], null);
    this.HighlightedFields = Object.assign([], null);
    this.MergeFieldsSelectedList = Object.assign([], null);
    this.adminService.GetTemplateDetails()
      .subscribe((data: any[]) => {
        this.ordersData = data;
        this.showTemplatesToBeModified = true;
        this.showTemplates = !this.showTemplates;

        this.processsingData = false;

      });
  }
  backToMainSection() {
    this.showTemplates = !this.showTemplates;
    this.DictionaryInfoInPixel = Object.assign([], null);
    this.Dictionary = Object.assign([], null);
    this.HighlightedFields = Object.assign([], null);
    this.MergeFieldsSelectedList = Object.assign([], null);
    this.showEditableTemplateData = false;
  }
  getPDF(pdfData: any) {
    this.templateId = pdfData.TemplateId;
    this.adminService.GetPdfDetails(pdfData.TemplateId, pdfData.TemplateName).pipe(retry(5)).subscribe((response: any) => {

      this.data = this.convertDataURIToBinary(response.pdfData);
      this.adminService.S3Download(pdfData.TemplateId, constants.S3DocType.Dictionary).subscribe(dict => {
        this.Dictionary = dict.data;
        setTimeout(() => {
        }, 2000);
        this.CalculateDictInfoInPixels();
      });
      this.showTemplatesToBeModified = false;
      this.processsingData = true;
      this.loaderMessage = "Fetching Template Details ....";
      setTimeout(() => {

        response.TemplateParameter.mergeFields.forEach((templateMergeField: MergeFieldContainer) => {

          const rect = document.createElement("div");
          rect.className = "rectangle";
          rect.id = templateMergeField.id;
          rect.style.position = "absolute";
          rect.style.border = "2px solid #0084FF";
          rect.style.borderRadius = "3px";
          rect.style.left = (templateMergeField.x1 / templateMergeField.width) * this.pageCoordinates.width + "px";
          rect.style.top = (templateMergeField.y1 / templateMergeField.height) * this.pageCoordinates.height + "px";
          rect.style.width = ((templateMergeField.x2 - templateMergeField.x1) / templateMergeField.width) * this.pageCoordinates.width + "px";
          rect.style.height = ((templateMergeField.y2 - templateMergeField.y1) / templateMergeField.height) * this.pageCoordinates.height + "px";
          rect.style.cursor = "pointer";
          this.path
            .find(p => p.className == "page")
            .children[2].appendChild(rect);
          this.HighlightedFields.push(new MergeFieldContainer(templateMergeField.id, (templateMergeField.x1 / templateMergeField.width) * this.pageCoordinates.width, (templateMergeField.x2 / templateMergeField.width) * this.pageCoordinates.width, (templateMergeField.y1 / templateMergeField.height) * this.pageCoordinates.height, (templateMergeField.y2 / templateMergeField.height) * this.pageCoordinates.height, this.pageCoordinates.height,
            this.pageCoordinates.width, templateMergeField.mergeFieldText, templateMergeField.mergeFieldIdentifier, "", templateMergeField.isBlankField, templateMergeField.mergeFieldIdentifier));
          this.MergeFieldsSelectedList.push(new MergeFieldContainer(templateMergeField.id, (templateMergeField.x1 / templateMergeField.width) * this.pageCoordinates.width, (templateMergeField.x2 / templateMergeField.width) * this.pageCoordinates.width, (templateMergeField.y1 / templateMergeField.height) * this.pageCoordinates.height, (templateMergeField.y2 / templateMergeField.height) * this.pageCoordinates.height, this.pageCoordinates.height,
            this.pageCoordinates.width, templateMergeField.mergeFieldText, templateMergeField.mergeFieldIdentifier, "", templateMergeField.isBlankField, templateMergeField.mergeFieldIdentifier));

        })
        this.processsingData = false;
        this.showEditableTemplateData = true;
      }, 5000)

    });


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
  changeProject(event: any) {
    this.projectName = event;
    if (event !== undefined) {
      this.adminService.GetMergeFieldsNames(event).subscribe(fields => {
        this.mergeFieldTypes = fields;
      })
    }
  }
  addExtraMergeField() {
    this.MergeFieldsSelectedList.push(new MergeFieldContainer("rectangle-" + this.indexCount++, 0, 0, 0, 0, this.pageCoordinates.height, this.pageCoordinates.width, "Enter_Text_" + this.addExtraFieldCounter++, "", "", true, ""));

  }
}

class Position {
  x: number;
  y: number;
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

