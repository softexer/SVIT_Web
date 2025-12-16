import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 selectedExam: string = ""; 
 constructor( private router: Router,){

 }

  exams = ['EAPCET', 'ECET'];
  onChange(e: Event) {
    // ngModel already sets selectedExam, but keep if you need extra logic
    this.selectedExam = (e.target as HTMLSelectElement).value;
    if(this.selectedExam !=''){
    localStorage.setItem('PreSelectExam',this.selectedExam)
    //  this.router.navigateByUrl('/register');
     this.router.navigateByUrl('/login');
    }
  }
  AdminLogin(){
    // const targetUrl = 'https://svit-admin.surge.sh/#/login';
    const targetUrl = 'https://admin.atpsvit.softexer.com/#/login';
  window.open(targetUrl, '_blank');
  }
}
