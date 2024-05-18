import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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

  constructor(private router: Router){

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

}
