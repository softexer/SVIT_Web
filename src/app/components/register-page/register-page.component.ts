import { Component, Inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { VerificationComponent } from "../verification/verification.component"
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog"
import { HttpErrorResponse } from "@angular/common/http"
import { SVITCustomerService } from "src/app/services/svit-customer.service"
import { MatSnackBar } from "@angular/material/snack-bar"

import { AuthService } from "src/app/services/auth.service"
import { PushMessagingService } from "src/app/services/push-messaging.service";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { WindowService } from "src/app/services/window.service";

var firconfig = {
  apiKey: "AIzaSyAgetZuSTCipWBiRnt7y6FkG7dn0HTlHbM",
  authDomain: "svit-e610a.firebaseapp.com",
  projectId: "svit-e610a",
  storageBucket: "svit-e610a.firebasestorage.app",
  messagingSenderId: "372869535016",
  appId: "1:372869535016:web:5154218e87e5a50e3b2c1d",
  measurementId: "G-28S4HRBYGJ"
}


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit {
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    inputClass: 'otp-input',
    placeholder: "",
    inputStyles: {
      width: "34px",
      height: "34px",
      outline: "none",
      font: "normal normal normal 17px/23px Inter",
    },
  };
  isSuccessPage: boolean = false;
  windowRef: any;
  isValidOtp: boolean = false;
  constructor(private router: Router,
    private dialog: MatDialog,
    private Customerservice: SVITCustomerService,
    private snackBar: MatSnackBar,
    private win: WindowService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pushMessageService: PushMessagingService,
    private pushService: PushMessagingService,
    private authService: AuthService
  ) { }
  formData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    mobileNo: "",
    fatherName: "",
    motherName: "",
    aanchor: "",
    village: "",
    mandal: "",
    district: "",
    collegeName: "",
    instaId: "",
    facebook: "",
    email: "",
    // applino: "",
    // halltno: ""
  }
  errors: { [key: string]: string } = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    mobileNo: "",
    fatherName: "",
    motherName: "",
    district: ""
  };

  userCredentials = {
    userId: "",
    password: "",
  }
  districtList: string[] = [];

  ngOnInit(): void {
    this.loadDistricts();
    this.authService.setupReCaptcha('recaptcha-container');
  }


  validateForm(): boolean {
    let isValid = true;

    // Reset all errors
    this.errors = {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      mobileNo: "",
      fatherName: "",
      motherName: "",
      district: ""
    };

    if (!this.formData.firstName.trim()) {
      this.errors["firstName"] = "First Name is required";
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.errors["lastName"] = "Last Name is required";
      isValid = false;
    }

    if (!this.formData.dateOfBirth) {
      this.errors["dateOfBirth"] = "Date of Birth is required";
      isValid = false;
    }

    if (!this.formData.mobileNo || this.formData.mobileNo.length !== 10) {
      this.errors["mobileNo"] = "Mobile number must be 10 digits";
      isValid = false;
    }

    if (!this.formData.fatherName.trim()) {
      this.errors["fatherName"] = "Father Name is required";
      isValid = false;
    }

    if (!this.formData.motherName.trim()) {
      this.errors["motherName"] = "Mother Name is required";
      isValid = false;
    }

    if (!this.formData.district.trim()) {
      this.errors["district"] = "District is required";
      isValid = false;
    }

    return isValid;
  }


  loadDistricts() {
    this.districtList = [
      'Anantapur',
      'Chittoor',
      'East Godavari',
      'Guntur',
      'Kadapa',
      'Krishna',
      'Kurnool',
      'Nellore',
      'Prakasam',
      'Srikakulam',
      'Visakhapatnam',
      'Vizianagaram',
      'West Godavari'
    ];
  }
  formatDob(date: string): string {
    if (!date) return "";
    const parts = date.split("-");
    return parts[2] + parts[1] + parts[0]; // ddmmyyyy
  }

  clearError(field: string) {
    this.errors[field] = "";
  }
  onDistrictChange() {
    if (this.formData.district && this.formData.district.trim() !== "") {
      this.errors['district'] = "";
    }
  }

  validateMobile() {
    const value = this.formData.mobileNo;

    if (!value || value.trim() === "") {
      this.mobileError = "Mobile number is required.";
      return;
    }

    if (value.length !== 10) {
      this.mobileError = "Mobile number must be 10 digits.";
      return;
    }

    this.mobileError = ""; // Clear error
  }
  onRegisterNow(form: any) {
    if (!this.validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2️⃣ Check if OTP is Verified
    if (!this.isValidOtp) {
      this.openSnackBar("Please verify your mobile number before submitting!", "");
      return;
    }

    const formattedDob = this.convertDobFormat(this.formData.dateOfBirth);
    console.log(formattedDob)

    const apiObj = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      dob: formattedDob,
      phoneNumber: this.formData.mobileNo,
      fatherName: this.formData.fatherName,
      motherName: this.formData.motherName,
      aadharNo: this.formData.aanchor,

      village: this.formData.village,
      mandal: this.formData.mandal,
      district: this.formData.district,

      collegeName: this.formData.collegeName,
      facebookID: this.formData.facebook,
      instaID: this.formData.instaId,
      emailID: this.formData.email,
      // hallTicketNo: this.formData.applino,
      // applicationNo: this.formData.halltno,
    };

    console.log(apiObj)
    let token
    this.Customerservice.showLoader.next(true);
    this.Customerservice.goToSignup(apiObj, token).subscribe((posRes: any) => {
      console.log(posRes)
      if (posRes.response == 3) {
        this.Customerservice.showLoader.next(false);
        this.openSnackBar(posRes.message, "");
        this.userCredentials = {
          userId: this.formData.mobileNo,
          password: formattedDob,
        }
        this.isSuccessPage = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.Customerservice.showLoader.next(false);
        this.openSnackBar(posRes.message, "");
        this.router.navigateByUrl('/login')
      }
    },
      (err: HttpErrorResponse) => {
        this.openSnackBar(err.message, "");
        this.Customerservice.showLoader.next(false);
        if (err.error instanceof Error) {
          console.warn("Client SIde Error", err.error);
        } else {
          console.warn("Server Error", err.error);
        }
      })

  }
  convertDobFormat(dateString: string): string {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}${month}${year}`; // DDMMYYYY
  }


  onLogin(): void {
    console.log("Navigating to login page")
    this.router.navigateByUrl('/login');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: "red-snackbar",
    });
  }

  isFormValid(): boolean {
    return (
      this.formData.firstName.trim() !== "" &&
      this.formData.lastName.trim() !== "" &&
      this.formData.mobileNo.trim() !== ""
    )
  }
  mobileError: string = "";

  onVerify(): void {
    // 1. Validate mobile number
    if (!this.formData.mobileNo || this.formData.mobileNo.length !== 10) {
      this.mobileError = "Enter valid mobile number";
      return;
    }
    this.mobileError = "";

    this.authService.sendOtp("+91" + this.formData.mobileNo)
      .then(response => {
        console.log(response)
        if (response.success) {
          this.openOtpModal();
          console.log(response.message);
        } else {
          console.error(response.message);
        }
      });
  }

  openOtpModal() {
    let senddata = {
      mobile: this.formData.mobileNo
    }
    const dialogRef = this.dialog.open(VerificationComponent, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: "col-md-3",
      backdropClass: 'custom-backdrop',
      data: senddata
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isValidOtp = true;
      }

    });
  }

  loginNow(): void {
    this.router.navigate(["/login"])
  }

  numericOnly(event: any) {
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
  }
}
