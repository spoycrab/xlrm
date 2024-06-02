import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ProductService } from '../../product.service';
import { Product } from '../../product';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visualizar-produto',
  standalone: true,
  imports: [ 
    CommonModule,
		 ReactiveFormsModule,
		 MatInputModule,
		 MatFormFieldModule,
		 MatButtonModule,
		 MatCardModule,
		 MatIconModule,
     MatSelectModule,
     MatSortModule,
     MatPaginatorModule,
     MatTableModule

  ],
  templateUrl: './visualizar-produto.component.html',
  styleUrl: './visualizar-produto.component.css'
})
export class VisualizarProdutoComponent implements OnInit{

  productForm: FormGroup;
  editForm: FormGroup;
  products: Product[] = [];
  hasSearched = false;
  displayedColumns: string[] = ['code', 'name', 'description', 'quantity', 'price', 'created', 'edit'];
  dataSource: MatTableDataSource<Product>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  
  constructor(private fb: FormBuilder, private productService: ProductService, private router: Router) {
    this.productForm = this.fb.group({
      name: [''],
      code: [''],
    });
  

  this.editForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0.01)]]
  });

}

  // constructor(private router: Router){}


  onSubmit(): void {
    let product = new Product();
  
    product.name = String(this.productForm.get("productName")!.value);
    product.code = Number(this.productForm.get("Code")!.value);

    console.log(product);

    // const product = { name: 'Product Name', code: '123' };
    this.productService.searchProducts(product).subscribe();
      }


  goToTelaInicio(){
    this.router.navigate(['/telaInicio']);
  }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: [''],
      code: ['']
    });

    // Não carregar todos os produtos ao inicializar
  }

  loadAllProducts(): void {
    console.log('Loading all products...');
    this.productService.getAllProducts().subscribe(
      (data) => {
        console.log('All products loaded:', data);
        this.products = data || []; // Garantir que produtos será um array
        this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
      },
      (error) => {
        console.error('Error loading all products:', error);
        this.products = [];
        this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
      }
    );
  }

  onSearch(): void {
    const { name, code } = this.productForm.value;
    console.log('Form values:', { name, code });

    // Limpar a lista de produtos antes de nova busca
    this.products = [];
    this.hasSearched = false;

    if (name || code) {
      console.log('Searching with parameters:', { name, code });
      this.productService.getProductsByQuery({ name, code }).subscribe(
        (data) => {
          console.log('Products found:', data);
          this.products = data || []; // Garantir que produtos será um array
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        },
        (error) => {
          console.error('Error searching products:', error);
          this.products = [];
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        }
      );
    } else {
      console.log('No search parameters provided, loading all products...');
      console.log('Passou no else')
      this.loadAllProducts();
    }
  }

  editProduct(product: Product): void {
    Swal.fire({
      title: 'Editar Produto',
      html: `
        <input id="swal-input-quantity" class="swal2-input" type="number" value="${product.quantity}" placeholder="Quantidade">
        <input id="swal-input-name" class="swal2-input" value="${product.name}" placeholder="Nome">
        <input id="swal-input-description" class="swal2-input" value="${product.description}" placeholder="Descrição">
        <input id="swal-input-price" class="swal2-input" type="number" value="${product.price}" placeholder="Preço">
        <button id="swal-delete-button" class="swal2-confirm swal2-styled" style="background-color: #d33; margin-top: 1rem;">Deletar</button>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const quantity = (document.getElementById('swal-input-quantity') as HTMLInputElement).value;
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const description = (document.getElementById('swal-input-description') as HTMLInputElement).value;
        const price = (document.getElementById('swal-input-price') as HTMLInputElement).value;

        if (!name || !description || !quantity || !price) {
          Swal.showValidationMessage('Todos os campos são obrigatórios.');
          return false;
        }

        return { name, description, quantity: Number(quantity), price: Number(price) };
      },
      didOpen: () => {
        const deleteButton = document.getElementById('swal-delete-button');
        deleteButton?.addEventListener('click', () => {
          Swal.fire({
            title: 'Tem certeza?',
            text: 'Você não poderá reverter isso!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!'
          }).then((result) => {
            if (result.isConfirmed) {
              this.deleteProduct(product);
              Swal.close();
            }
          });
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const editedProduct = result.value;
        product.name = editedProduct.name;
        product.description = editedProduct.description;
        product.quantity = editedProduct.quantity;
        product.price = editedProduct.price;

        this.productService.updateProduct(product).subscribe(
          (response) => {
            Swal.fire('Sucesso', 'Produto atualizado com sucesso', 'success');
            this.loadAllProducts();
          },
          (error) => {
            Swal.fire('Erro', 'Erro ao atualizar produto', 'error');
          }
        );
      }
    });
  }

  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product).subscribe(
      (response) => {
        Swal.fire('Deletado!', 'Seu produto foi deletado.', 'success');
        this.loadAllProducts();
      },
      (error) => {
        Swal.fire('Erro', 'Erro ao deletar produto', 'error');
      }
    );
  }
}