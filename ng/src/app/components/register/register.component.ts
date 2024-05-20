import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../../user';
import { UserService } from '../../user.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
		CommonModule,
		 ReactiveFormsModule,
		 MatInputModule,
		 MatFormFieldModule,
		 MatButtonModule,
		 MatCardModule,
		 MatIconModule
		],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    userForm: FormGroup;

    constructor(private userService: UserService, private router: Router) { }

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
		console.log("OK!");
		Swal.fire({
			title: "Cadastro feito com sucesso!",
			text: "Bem vindo ao XLRM!",
			icon: "success"
		  });
		  setTimeout(() => {
			this.router.navigate(['/login']);
		  }, 3000); 
	    },
	    err => {
		console.log("FAIL!");
		/* 'err.message' is a user-friendly message... */
		console.log(err.message);
		Swal.fire({
			title: "Erro ao preencher os campos!",
			text: "Verifique os campos e tente novamente!",
			icon: "error"
		  });
	    }
	);
	/* this.userForm.reset(); */
    }
	goToLogin(): void {
		this.router.navigate(['/login']);
	  }
}
