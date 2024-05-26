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
  products: Product[] = [];
  hasSearched = false;
  displayedColumns: string[] = ['code', 'name', 'description', 'quantity', 'price', 'created'];
  dataSource: MatTableDataSource<Product>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  
  constructor(private fb: FormBuilder, private productService: ProductService, private router: Router) {
    this.productForm = this.fb.group({
      name: [''],
      code: [''],
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
}