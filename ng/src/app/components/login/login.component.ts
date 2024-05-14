import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { User } from '../../user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router, private userService: UserService){

  }

  nomeDaFuncao(){
    let user: User = new User();
    user.email = 'lucas.jd08.dias@outlook.com';
    user.pass = 'xlrm1234';
    this.userService.login(user);

    console.log("Yeah, it's working");
    Swal.fire({
      title: "Login feito com sucesso!",
      text: "Bem vindo ao XLRM!",
      icon: "success"
    });
    setTimeout(() => {
    this.router.navigate(['/telaInicio']);
    }, 3000)
  }

}
