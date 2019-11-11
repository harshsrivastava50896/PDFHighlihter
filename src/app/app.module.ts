import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormAdminComponent } from './form-admin/form-admin/form-admin.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from "@angular/common/http";
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { FilterPipe } from './filter.pipe';

import { LocationStrategy, HashLocationStrategy } from "@angular/common";

@NgModule({
  declarations: [ 
    AppComponent,
    FormAdminComponent,
    AdminComponent,
    UserComponent,
    FilterPipe

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    HttpClientModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
