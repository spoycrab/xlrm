import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tela-inicio',
  standalone: true,
  imports: [
    MatIconModule
  
  ],
  templateUrl: './tela-inicio.component.html',
  styleUrl: './tela-inicio.component.css'
})
export class TelaInicioComponent {

  constructor(private router: Router, private userService: UserService){

  }

  onNavigate(){
    this.router.navigate(['/estadoUsuario']);
  }

  onNavigate2(){
    this.router.navigate(['/concederAcesso']);
  }
  
  goToLogin(): void {
		this.router.navigate(['/login']);
	  }

  onNavigate3(){
    this.router.navigate(['/cadastrarProduto']);
  }

  onNavigate4(){
    this.router.navigate(['/cadastrarCliente']);
  }

  onNavigate5(){
    this.router.navigate(['/visualizarProduto']);
  }

  onNavigate6(){
    this.router.navigate(['/reavaliarUsuario']);
  }

  logout(event: Event): void {
    event.preventDefault();  // Prevenir comportamento padrão do formulário

    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Você quer sair da sua conta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, sair!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.logout().subscribe(
          () => {
            // Sucesso: redirecionar para a página de login ou homepage
            setTimeout(() => {this.router.navigate(['/login']);}, 3000);
            Swal.fire(
              'Desconectado!',
              'Você saiu da sua conta.',
              'success'
            );
          },
          error => {
            // Tratamento de erro, se necessário
            console.error('Erro ao fazer logout:', error);
          }
        );
      }
    });
  }


}
