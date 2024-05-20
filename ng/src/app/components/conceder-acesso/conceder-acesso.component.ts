import { Component, OnInit } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-conceder-acesso',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './conceder-acesso.component.html',
  styleUrl: './conceder-acesso.component.css'
})
export class ConcederAcessoComponent {

  usuarios: User[] = [];
  displayedColumns: string[] = ['name', 'status', 'action'];
  dataSource = new MatTableDataSource<User>();

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userService.getAllUsersAllowedWihoutPermissions().subscribe(
      (response) => {
        if (Array.isArray(response)) {
          this.usuarios = response;
        } else if (response != null) {
          this.usuarios = [response];
        }
      //  console.log(this.usuarios); // Certifique-se de que a variável usuarios seja uma matriz
      },
      (error) => {
        console.error("Erro ao obter usuários não registrados:", error);
        // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
      }
    );
  }
  concederAcesso(usuario: User): void {
    const id = usuario.id;
    Swal.fire({
      title: 'Selecione as permissões',
      html: `
        <input type="checkbox" id="produto" value="5">
        <label for="produto">Produto</label><br>
        <input type="checkbox" id="vendas" value="6">
        <label for="vendas">Vendas</label><br>
        <input type="checkbox" id="clientes" value="7">
        <label for="clientes">Clientes</label><br>
        <input type="checkbox" id="admin" value="3">
        <label for="admin">Administrador</label><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        let permissions = '';

        // Verificar quais opções foram selecionadas
        if ((<HTMLInputElement>document.getElementById('produto')).checked) {
          permissions += '5';
        }
        if ((<HTMLInputElement>document.getElementById('vendas')).checked) {
          permissions += '6';
        }
        if ((<HTMLInputElement>document.getElementById('clientes')).checked) {
          permissions += '7';
        }
        if ((<HTMLInputElement>document.getElementById('admin')).checked) {
          permissions += '3';
        }

        return permissions;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        let permissions = result.value;
        console.log('Permissões selecionadas:', permissions);

        permissions = parseInt(permissions, 10)
        let data = {id, permissions}
        console.log(data)


        // Chamar setUserPermission com as novas permissões
        this.userService.setUserPermission(data).subscribe(
          () => {
            console.log('Permissões atualizadas com sucesso!');
            Swal.fire({
              title: "Sucesso!",
              text: "As permissões foram alteradas com sucesso",
              icon: "success"
            }).then(() => {
              location.reload(); // Recarregar a página após exibir a mensagem de sucesso
            });
            // Aqui você pode realizar outras ações após a atualização das permissões
          },
          (error) => {
            console.error('Erro ao atualizar permissões:', error);
            Swal.fire({
              title: "Erro!",
              text: "Ocorreu um erro, por favor tente novamente!",
              icon: "error"
            }).then(() => {
              location.reload(); // Recarregar a página após exibir a mensagem de sucesso
            });
            // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
          }
        );
      }
    });
  }

  goToTelaInicio(): void {
		this.router.navigate(['/telaInicio']);
	  }
}
