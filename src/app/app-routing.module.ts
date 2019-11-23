import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FormAdminComponent } from "./form-admin/form-admin/form-admin.component";
import { AdminComponent } from "./admin/admin.component";
import { UserComponent } from "./user/user.component";
import { ProjectNameComponent } from "./admin/admin-project-name/project-name/project-name.component";

const routes: Routes = [
  { path: "", redirectTo: "/admin", pathMatch: "full" },
  { path: "*", redirectTo: "/admin", pathMatch: "full" },
  {
    path: "admin",
    component: AdminComponent
  }, 
  {
    path: "user",
    component: UserComponent
  },
  {
    path: "applicationname",
    component: ProjectNameComponent
  }
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
