import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FormAdminComponent } from "./form-admin/form-admin/form-admin.component";
import { AdminComponent } from "./admin/admin.component";
import { UserComponent } from "./user/user.component";

const routes: Routes = [
  { path: "", redirectTo: "/admin", pathMatch: "full" },
  {
    path: "admin",
    component: AdminComponent
  },
  {
    path: "user",
    component: UserComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
