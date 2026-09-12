import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";


@Component({
  imports: [CommonModule, SidebarComponent],
  standalone: true,
  selector: 'app-adminpanal',
  templateUrl: './adminpanal.html'
})


export class AdminPanalComponent {




}
