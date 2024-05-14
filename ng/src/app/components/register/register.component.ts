import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../../user';
import { UserService } from '../../user.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    userForm: FormGroup;

    constructor(private userService: UserService) { }

    get email() {
	return this.userForm.get("email");
    }

    get pass1() {
	return this.userForm.get("pass1");
    }

    get pass2() {
	return this.userForm.get("pass2");
    }

    get name() {
	return this.userForm.get("name");
    }

    get birthDate() {
	return this.userForm.get("birthDate");
    }

    ngOnInit(): void {
	this.userForm = new FormGroup({
	    email: new FormControl("", [
		Validators.required
	    ]),
	    pass1: new FormControl("", [
		Validators.required,
		Validators.minLength(8)
	    ]),
	    pass2: new FormControl("", [
		Validators.required,
		Validators.minLength(8)
	    ]),
	    name: new FormControl("", Validators.required),
	    birthDate: new FormControl("", Validators.required)
	});
    }

    onSubmit(): void {
	let user = new User();

	user.pass = String(this.userForm.get("pass1")!.value);
	user.name = String(this.userForm.get("name")!.value);
	user.email = String(this.userForm.get("email")!.value);
	user.birthDate = String(this.userForm.get("birthDate")!.value);
	this.userService.register(user).subscribe(
	    res => {
		alert("OK!");
	    },
	    err => {
		alert("FAIL!");
		/* 'err.message' is a user-friendly message... */
		console.log(err.message);
	    }
	);
	/* this.userForm.reset(); */
    }
}
