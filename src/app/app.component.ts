import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { SVITCustomerService } from "./services/svit-customer.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SVIT-Customer';
  loading: boolean = false;
  constructor(
    private router: Router,
    private customerservice: SVITCustomerService,
    private activatedRoute: ActivatedRoute) {
    this.customerservice.showLoader.subscribe((flag: boolean) => {
      if (this.loading !== flag) {
        this.loading = flag;
      }
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
