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
    selector: 'app-conceder-acesso',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './conceder-acesso.component.html',
    styleUrl: './conceder-acesso.component.css'
})
export class ConcederAcessoComponent {
    users: User[] = [];
    displayedColumns: string[] = ['name', 'status', 'action'];
    dataSource = new MatTableDataSource<User>();

    constructor(private userService: UserService, private router: Router) { }

    ngOnInit(): void {
        this.userService.getAllUsersAllowedWihoutPermissions().subscribe(
            (response) => {
                if (Array.isArray(response)) {
                    this.users = response;
                } else if (response != null) {
                    this.users = [response];
                }
            },
            (error) => {
                console.error("Erro ao obter usuários não registrados:", error);
            }
        );
    }

    grantAccess(user: User): void {
        const id = user.id;

        Swal.fire({
            title: 'Selecione as permissões',
            html: `
<input type="checkbox" id="cust">
<label for="cust">Clientes</label><br>
<input type="checkbox" id="product">
<label for="product">Produto</label><br>
<input type="checkbox" id="sale">
<label for="sale">Vendas</label><br>
<input type="checkbox" id="admin">
<label for="admin">Administradbor</label><br>
`,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                let value = 0;

                if ((<HTMLInputElement>document.getElementById("cust")).checked) {
                    value |= UserPermissions.CUST;
                }
                if ((<HTMLInputElement>document.getElementById("product")).checked) {
                    value |= UserPermissions.PRODUCT;
                }
                if ((<HTMLInputElement>document.getElementById("sale")).checked) {
                    value |= UserPermissions.SALE;
                }
                if ((<HTMLInputElement>document.getElementById("admin")).checked) {
                    value |= UserPermissions.ADMIN;
                }
                return value;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let permissions = parseInt(result.value);

                if (isNaN(permissions) || permissions == 0) {
                    return;
                }

                let data = {id, permissions}

                this.userService.setUserPermission(data).subscribe(
                    () => {
                        Swal.fire({
                            title: "Sucesso!",
                            text: "As permissões foram alteradas com sucesso.",
                            icon: "success"
                        }).then(() => {
                            location.reload();
                        });
                    },
                    (error) => {
                        Swal.fire({
                            title: "Erro!",
                            text: "Ocorreu um erro, por favor tente novamente!",
                            icon: "error"
                        }).then(() => {
                            location.reload();
                        });
                    }
                );
            }
        });
    }

    goToTelaInicio(): void {
        this.router.navigate(['/telaInicio']);
    }
}
