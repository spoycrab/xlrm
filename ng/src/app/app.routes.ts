import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TelaInicioComponent } from './components/tela-inicio/tela-inicio.component';
import { AprovarRejeitarUserComponent } from './components/aprovar-rejeitar-user/aprovar-rejeitar-user.component';
import { ConcederAcessoComponent } from './components/conceder-acesso/conceder-acesso.component';
import { CadastrarProdutoComponent } from './components/cadastrar-produto/cadastrar-produto.component';
import { CadastrarClienteComponent } from './components/cadastrar-cliente/cadastrar-cliente.component';
import { VisualizarProdutoComponent } from './components/visualizar-produto/visualizar-produto.component';
import { RevogarAcessoComponent } from './components/revogar-acesso/reavaliar-acesso.component';

export const ROUTES: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    {
        path: "telaInicio", component: TelaInicioComponent
    },
    {
        path: "estadoUsuario", component: AprovarRejeitarUserComponent
    },
    {
        path: "concederAcesso", component: ConcederAcessoComponent
    },
    {
        path: "cadastrarProduto", component: CadastrarProdutoComponent  
    },
    {
    path: "cadastrarCliente", component: CadastrarClienteComponent
    },
    {
        path: "visualizarProduto", component: VisualizarProdutoComponent
    },
    {
        path: "reavaliarUsuario", component: RevogarAcessoComponent
    }
];
