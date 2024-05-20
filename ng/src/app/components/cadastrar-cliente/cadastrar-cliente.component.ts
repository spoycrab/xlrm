import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CustomerService } from '../../customer.service';
import { Customer } from '../../customer';

@Component({
  selector: 'app-cadastrar-cliente',
  standalone: true,
  imports: [
		CommonModule,
		 ReactiveFormsModule,
		 MatInputModule,
		 MatFormFieldModule,
		 MatButtonModule,
		 MatCardModule,
		 MatIconModule,
     MatSelectModule
		],
  templateUrl: './cadastrar-cliente.component.html',
  styleUrl: './cadastrar-cliente.component.css'
})
export class CadastrarClienteComponent {
  customerForm: FormGroup;

  constructor(private fb: FormBuilder, private customerService: CustomerService, private router: Router) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      fullName: ['', Validators.required],
      document: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      type: ['', Validators.required],
      streetAdress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  onSubmit(): void {
    let customer = new Customer();
  
    customer.firstName = String(this.customerForm.get("firstName")!.value);
    customer.fullName = String(this.customerForm.get("fullName")!.value);
    customer.document = String(this.customerForm.get("document")!.value);
    customer.email = String(this.customerForm.get("email")!.value);
    customer.phoneNumber = String(this.customerForm.get("phoneNumber")!.value);
    customer.type = String(this.customerForm.get("type")!.value);
    customer.streetAdress = String(this.customerForm.get("streetAdress")!.value);
    customer.city = String(this.customerForm.get("city")!.value);
    customer.state = String(this.customerForm.get("state")!.value);
    customer.zipCode = String(this.customerForm.get("zipCode")!.value);
    customer.country = String(this.customerForm.get("country")!.value);

    this.customerService.registerCustomer(customer).subscribe(
        res => {
      console.log("OK!");
      Swal.fire({
        title: "Cadastro feito com sucesso!",
        text: "Cliente Cadastrado!",
        icon: "success"
        });
        setTimeout(() => {
          this.router.navigate(['/telaInicio']);
        }, 3000); // redireciona para tela de Inicio depois de 3 segundos;  
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

      }
      goToTelaInicio(): void {
        this.router.navigate(['/telaInicio']);
        }


}
