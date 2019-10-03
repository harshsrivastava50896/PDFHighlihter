import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-form-admin',
  templateUrl: './form-admin.component.html',
  styleUrls: ['./form-admin.component.scss']
})
export class FormAdminComponent implements OnInit {
  @Input() extractedData : string[];
  constructor() { }

  ngOnInit() {
  }

}
