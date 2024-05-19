import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tela-inicio',
  standalone: true,
  imports: [
  
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

  onNavigate3(){
    this.router.navigate(['/cadastrarProduto']);
  }

}
