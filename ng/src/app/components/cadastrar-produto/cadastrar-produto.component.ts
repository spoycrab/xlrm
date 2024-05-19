import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../product';  
import { ProductService } from '../../product.service';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from '@angular/material/form-field';
import '../../components/cadastrar-produto/cadastrar-produto.component.css';
import { Router } from '@angular/router';



@Component({
  selector: 'app-cadastrar-produto',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, MatInputModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './cadastrar-produto.component.html',
  styleUrl: './cadastrar-produto.component.css'
})
export class CadastrarProdutoComponent {
  productForm: FormGroup;

  constructor(private productService: ProductService, private router: Router) { }

  get productName() {
return this.productForm.get("productName");
  }

  get description() {
return this.productForm.get("description");
  }

  get quantity() {
return this.productForm.get("quantity");
  }

  get factory() {
return this.productForm.get("factory");
  }

  get priceTag() {
return this.productForm.get("priceTag");
  }

  ngOnInit(): void {
this.productForm = new FormGroup({
  productName: new FormControl("", [
  Validators.required
    ]),
    description: new FormControl("", [
  Validators.required,
  Validators.minLength(8)
    ]),
    quantity: new FormControl("", [
  Validators.required,
  Validators.minLength(8)
    ]),
    factory: new FormControl("", Validators.required),
    priceTag: new FormControl("", Validators.required)
});
  }

  onSubmit(): void {
let product = new Product();

product.name = String(this.productForm.get("productName")!.value);
product.description = String(this.productForm.get("description")!.value);
product.quantity = Number(this.productForm.get("quantity")!.value);
product.manufacturer = String(this.productForm.get("factory")!.value);
product.price = Number(this.productForm.get("priceTag")!.value);

console.log(product);
this.productService.registerProduct(product).subscribe(
    res => {
  console.log("OK!");
  Swal.fire({
    title: "Produto cadastrado com sucesso!",
    text: "teste",
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
/* this.productForm.reset(); */
  }


}
