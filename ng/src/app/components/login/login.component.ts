import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { User } from '../../user';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private router: Router, private userService: UserService){

  }

  get email() {
    return this.loginForm.get("email2");
      }
  
      get pass() {
    return this.loginForm.get("pass4");
      }

      ngOnInit(): void {
        this.loginForm = new FormGroup({
          email: new FormControl("", [
            Validators.required
              ]),
              pass1: new FormControl("", [
            Validators.required,
            Validators.minLength(8)
              ])
        })

      }

    
  onSubmit(): void {
    if (this.loginForm.valid) {
      let user = new User();
      user.pass = String(this.loginForm.get("pass1")!.value);
      user.email = String(this.loginForm.get("email")!.value);

      this.userService.login(user).subscribe(
        (response) => {
          // Armazenar o cookie
          const cookie = response.headers.get('Set-Cookie');
          localStorage.setItem('sessionCookie', cookie);
          
          // Lidar com outras ações após o login, como redirecionar para outra página
        },
        (error) => {
          console.error("Erro ao fazer login:", error);
          // Lidar com o erro, por exemplo, exibir uma mensagem de erro para o usuário
        }
      );

      // Simular a validação bem-sucedida para redirecionamento
      Swal.fire({
        title: "Login feito com sucesso!",
        text: "Bem vindo ao XLRM!",
        icon: "success"
      });

      // Redirecionar após um pequeno atraso
      setTimeout(() => {
        this.router.navigate(['/telaInicio']);
      }, 3000);
    } else {

      Swal.fire({
        title: "Falha no Login!",
        text: "Login ou senha incorretos!",
        icon: "error"
      });
      // Se o formulário não for válido, você pode adicionar lógica adicional aqui, se necessário
    }
  }

  nomeDaFuncao(){
    // Você pode remover ou ajustar esta função conforme necessário
    console.log("Yeah, it's working");
  }
}