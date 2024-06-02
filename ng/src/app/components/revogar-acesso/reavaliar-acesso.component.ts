import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { User, UserPermissions } from '../../user';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-reavaliar-acesso',
  standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './reavaliar-acesso.component.html',
    styleUrl: './reavaliar-acesso.component.css'
  })
  export class RevogarAcessoComponent {

    users: User[] = [];
    approvedUsers: User[] = [];
    rejectedUsers: User[] = [];
    displayedColumns: string[] = ['name', 'status', 'action'];
    dataSource = new MatTableDataSource<User>();

    constructor(private userService: UserService, private router: Router) { }

    ngOnInit(): void {
        this.loadApprovedUsers();
        this.loadRejectedUsers();
      }

      loadApprovedUsers(): void {
        this.userService.getAllUsersAllowed().subscribe(
          (response) => {
            if (Array.isArray(response)) {
              this.approvedUsers = response;
            } else if (response != null) {
              this.approvedUsers = [response];
            }
          },
          (error) => {
            console.error("Erro ao obter usuários aprovados:", error);
          }
        );
      }

      loadRejectedUsers(): void {
        this.userService.getAllRejected().subscribe(
          (response) => {
            if (Array.isArray(response)) {
              this.rejectedUsers = response;
            } else if (response != null) {
              this.rejectedUsers = [response];
            }
          },
          (error) => {
            console.error("Erro ao obter usuários reprovados:", error);
          }
        );
      }

      modificarParaReprovado(usuario: User) {
        const id = usuario.id;

        Swal.fire({
          title: 'Você quer modificar o status do usuário para reprovado?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não'
        }).then((result) => {
          if (result.isConfirmed) {
            const permissions = UserPermissions.REJECTED;
            const data = { id, permissions };

            this.userService.setUserPermission(data).subscribe(
              () => {
                Swal.fire({
                  title: "Reprovado!",
                  text: "O usuário foi reprovado.",
                  icon: "error"
                }).then(() => {
                  location.reload(); // Recarregar a página após exibir a mensagem de erro
                });
              },
              (error) => {
                console.error("Erro ao definir permissão para o usuário com ID:", id, error);
                // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
              }
            );
          }
        });
      }

      modificarParaAprovado(usuario: User) {
        const id = usuario.id;

        Swal.fire({
          title: 'Você quer modificar o status do usuário para aprovado?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não'
        }).then((result) => {
          if (result.isConfirmed) {
            const permissions = UserPermissions.ACCEPTED;
            const data = { id, permissions };

            this.userService.setUserPermission(data).subscribe(
              () => {
                Swal.fire({
                  title: "Aprovado!",
                  text: "O usuário foi aprovado.",
                  icon: "success"
                }).then(() => {
                  location.reload(); // Recarregar a página após exibir a mensagem de sucesso
                });
              },
              (error) => {
                console.error("Erro ao definir permissão para o usuário com ID:", id, error);
                // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
              }
            );
          }
        });
      }




//     modifyAcessoAllowed(user: User): void {
//         const id = user.id;

//         Swal.fire({
//             title: 'Selecione as permissões',
//             html: `
// <input type="checkbox" id="cust">
// <label for="cust">Clientes</label><br>
// <input type="checkbox" id="product">
// <label for="product">Produto</label><br>
// <input type="checkbox" id="sale">
// <label for="sale">Vendas</label><br>
// <input type="checkbox" id="all">
// <label for="all">Administradbor</label><br>
// `,
//             showCancelButton: true,
//             confirmButtonText: 'Confirmar',
//             cancelButtonText: 'Cancelar',
//             preConfirm: () => {
//                 let permissions = 0;

//                 if ((<HTMLInputElement>document.getElementById("cust")).checked) {
//                     permissions |= 4;
//                 }
//                 if ((<HTMLInputElement>document.getElementById("product")).checked) {
//                     permissions |= 8;
//                 }
//                 if ((<HTMLInputElement>document.getElementById("sale")).checked) {
//                     permissions |= 16;
//                 }
//                 if ((<HTMLInputElement>document.getElementById("all")).checked) {
//                     permissions |= 32;
//                 }

//                 return permissions;
//             }
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 let permissions = parseInt(result.value);

//                 if (isNaN(permissions)) {
//                     permissions = 0;
//                 }

//                 let data = {id, permissions}

//                 this.userService.setUserPermission(data).subscribe(
//                     () => {
//                         Swal.fire({
//                             title: "Sucesso!",
//                             text: "As permissões foram alteradas com sucesso",
//                             icon: "success"
//                         }).then(() => {
//                             location.reload(); // Recarregar a página após exibir a mensagem de sucesso
//                         });
//                     },
//                     (error) => {
//                         Swal.fire({
//                             title: "Erro!",
//                             text: "Ocorreu um erro, por favor tente novamente!",
//                             icon: "error"
//                         }).then(() => {
//                             location.reload(); // Recarregar a página após exibir a mensagem de sucesso
//                         });
//                     }
//                 );
//             }
//         });
//     }


    goToTelaInicio(): void {
	this.router.navigate(['/telaInicio']);
    }
}
