import { Component, OnInit } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-aprovar-rejeitar-user',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './aprovar-rejeitar-user.component.html',
  styleUrl: './aprovar-rejeitar-user.component.css'
})
export class AprovarRejeitarUserComponent {

    usuarios: User[] = [];
    displayedColumns: string[] = ['name', 'status', 'action'];
  dataSource = new MatTableDataSource<User>();

  constructor(private userService: UserService, private router: Router) { }

  
ngOnInit(): void {
  this.userService.getUsuariosSemPermissao().subscribe(
    (response) => {
      if (Array.isArray(response)) {
        this.usuarios = response;
        ;
      } else {
        this.usuarios = [response];
      }
      console.log(this.usuarios); // Certifique-se de que a variável usuarios seja uma matriz
    },
    (error) => {
      console.error("Erro ao obter usuários não registrados 2:", error);
      // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
    }
  );
}

acaoUsuario(usuario: User) {
  const id = usuario.id;

  // Mostrar mensagem do SweetAlert com as opções "Aprovar" e "Reprovar"
  Swal.fire({
    title: 'Escolha uma opção',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Aprovar',
    cancelButtonText: 'Reprovar'
  }).then((result) => {
    let permissions: number;

    // Definir o valor de permission com base na opção escolhida
    if (result.isConfirmed) {
      permissions = 2; // Aprovar
      Swal.fire({
        title: "Aprovado!",
        text: "O usuário já pode entrar",
        icon: "success"
      }).then(() => {
        location.reload(); // Recarregar a página após exibir a mensagem de sucesso
      });
    } else {
      permissions = 1; // Reprovar
      Swal.fire({
        title: "Rejeitado!",
        text: "O usuário não foi aprovado.",
        icon: "error"
      }).then(() => {
        location.reload(); // Recarregar a página após exibir a mensagem de erro
      });
    }

    let data = {id, permissions}
    console.log(data)
    // Chamar setUserPermission com o ID do usuário e a permissão
    this.userService.setUserPermission(data).subscribe(
      () => {
        console.log("Permissão definida com sucesso para o usuário com ID:", id);
        // Atualizar a lista de usuários ou tomar outras ações necessárias
      },
      (error) => {
        console.error("Erro ao definir permissão para o usuário com ID:", id, error);
        // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
      }
    );
  });
}

goToTelaInicio(): void {
  this.router.navigate(['/telaInicio']);
  }
}