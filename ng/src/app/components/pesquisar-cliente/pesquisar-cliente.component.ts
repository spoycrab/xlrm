import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CustomerService } from '../../customer.service';
import { Customer } from '../../customer';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pesquisar-cliente',
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
  templateUrl: './pesquisar-cliente.component.html',
  styleUrl: './pesquisar-cliente.component.css'
})
export class PesquisarClienteComponent {

  customerForm: FormGroup;
  editForm: FormGroup;
  customers: Customer[] = [];
  hasSearched = false;
  displayedColumns: string[] = ['fullName', 'email', 'document', 'phoneNumber', 'streetAddress', 'created', 'edit'];
  dataSource: MatTableDataSource<Customer>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  
  constructor(private fb: FormBuilder, private customerService: CustomerService, private router: Router) {
    
  

  // this.editForm = this.fb.group({
  //   name: ['', Validators.required],
  //   description: ['', Validators.required],
  //   quantity: [0, [Validators.required, Validators.min(1)]],
  //   price: [0, [Validators.required, Validators.min(0.01)]]
  // });

}

  // constructor(private router: Router){}


  


  goToTelaInicio(){
    this.router.navigate(['/telaInicio']);
  }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      fullName: [''],
      document: ['']
    });

    // Não carregar todos os clientes ao inicializar
  }

  loadAllCustomers(): void {
    console.log('Loading all customers...');
    this.customerService.getAllCustomers().subscribe(
      (data) => {
        console.log('All customers loaded:', data);
        this.customers = data || []; // Garantir que clientes será um array
        this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
      },
      (error) => {
        console.error('Error loading all customers:', error);
        this.customers = [];
        this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
      }
    );
  }

  // onSearch(): void {
  //   const { fullName, document } = this.customerForm.value;
  //   console.log('Form values:', { fullName, document });
  //   console.log(this.customerForm)

  //   // Limpar a lista de produtos antes de nova busca
  //   this.customers = [];
  //   this.hasSearched = false;

  //   if (fullName || document) {
  //     console.log('Searching with parameters:', { fullName, document });
  //     let newCustomer: Customer = new Customer;
  //     newCustomer.fullName = fullName;
  //     newCustomer.document = document; 
  //     this.customerService.searchCustomers( newCustomer ).subscribe(
  //       (data) => {
  //         console.log('customer found: ', data);
  //         this.customers = data || []; // Garantir que produtos será um array
  //         console.log(this.customers.length)
  //         this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
  //       },
  //       (error) => {
  //         console.error('Error searching products:', error);
  //         this.customers = [];
  //         this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
  //       }
  //     );
  //   } else {
  //     console.log('No search parameters provided, loading all products...');
  //     console.log('Passou no else')
  //     this.loadAllCustomers();
  //   }
  // }

  onSearch(): void {
    const { fullName, document } = this.customerForm.value;
    // console.log('Form values:', { fullName, document });
    // console.log(this.customerForm);

    // Limpar a lista de produtos antes de nova busca
    this.customers = [];
    this.hasSearched = false;
    if (fullName) {  
      this.customerService.getCustomerByName(fullName).subscribe( // Certifique-se que é 'customerService'
        (data) => {
          //console.log('customer found: ', data);
          this.customers = data || []; // Garantir que produtos será um array
          //console.log(this.customers.length);
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        },
        (error) => {
          //console.error('Error searching customers:', error);
          this.customers = [];
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        }
      );
    } else if (document) {
      this.customerService.getCustomerByDocument(document).subscribe( // Certifique-se que é 'customerService'
        (data) => {
          //console.log('customer found: ', data);
          this.customers = [data] || []; // Garantir que produtos será um array
          //console.log(this.customers.length);
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        },
        (error) => {
          //console.error('Error searching customers:', error);
          this.customers = [];
          this.hasSearched = true; // Atualiza o estado para indicar que uma busca foi realizada
        }
      );
    } else {
      this.loadAllCustomers();
    }

    
}


  editCustomer(customer: Customer): void {
    Swal.fire({
      title: 'Editar Cliente',
      html: `
        <input id="swal-input-name" class="swal2-input"  value="${customer.fullName}" placeholder="Nome">
        <input id="swal-input-email" class="swal2-input" value="${customer.email}" placeholder="Email">
        <input id="swal-input-document" class="swal2-input" value="${customer.document}" placeholder="Documento">
        <input id="swal-input-phoneNumber" class="swal2-input"  value="${customer.phoneNumber}" placeholder="Telefone">
        <input id="swal-input-streetAddress" class="swal2-input"  value="${customer.streetAddress}" placeholder="Endereco">
        <button id="swal-delete-button" class="swal2-confirm swal2-styled" style="background-color: #d33; margin-top: 1rem;">Deletar</button>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const fullName = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
        const doc = (document.getElementById('swal-input-document') as HTMLInputElement).value;
        const phoneNumber = (document.getElementById('swal-input-phoneNumber') as HTMLInputElement).value;
        const streetAddress = (document.getElementById('swal-input-streetAddress') as HTMLInputElement).value;

        if (!fullName || !email || !doc || !phoneNumber || !streetAddress) {
          Swal.showValidationMessage('Todos os campos são obrigatórios.');
          return false;
        }

        return { fullName, email, doc, phoneNumber, streetAddress };
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
              this.deleteCustomers(customer);
              Swal.close();
            }
          });
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const editedCustomer = result.value;
        customer.fullName = editedCustomer.fullName;
        customer.email = editedCustomer.email;
        customer.document = editedCustomer.doc;
        customer.phoneNumber = editedCustomer.phoneNumber;
        customer.streetAddress = editedCustomer.streetAddress;
        console.log(customer);
        this.customerService.updateCustomer(customer).subscribe(
          (response) => {
            Swal.fire('Sucesso', 'Cliente atualizado com sucesso', 'success');
            this.loadAllCustomers();
          },
          (error) => {
            console.log(error)
            Swal.fire('Erro', 'Erro ao atualizar cliente', 'error');
          }
        );
      }
    });
  }

  deleteCustomers(customer: Customer): void {
    this.customerService.deleteCustomer(customer).subscribe(
      (response) => {
        Swal.fire('Deletado!', 'O cliente foi deletado.', 'success');
        this.loadAllCustomers();
      },
      (error) => {
        Swal.fire('Erro', 'Erro ao deletar o cliente', 'error');
      }
    );
  }

}
