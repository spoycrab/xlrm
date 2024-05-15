package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id          int64  `json:"id"`
	Pass        string `json:"pass"`
	Permissions uint8  `json:"permissions"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	BirthDate   string `json:"birthDate"`
	Created     string `json:"created"`
	Updated     string `json:"updated"`
}

func getUserById(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result, err := selectUserById(id)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	result.Pass = ""

	b, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	fmt.Fprintf(w, "%s\n", string(b))
}

func registerUser(w http.ResponseWriter, r *http.Request) {
	var user User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user.Id = 0
	user.Permissions = 0

	if len(user.Pass) == 0 {
		log.Println("'len(user.Pass) == 0'")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if len(user.Name) == 0 {
		log.Println("'len(user.Name) == 0'")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if len(user.Email) == 0 {
		log.Println("'len(user.Email) == 0'")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	_, err = selectUserByEmail(user.Email)
	if err == nil {
		log.Println("Email is invalid or already taken.")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"err": "Email is invalid or already taken."}` + "\n");
		return
	} else if err != nil && err != sql.ErrNoRows {
		log.Println("'err != sql.ErrNoRows'")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	_, err = time.Parse(time.DateOnly, user.BirthDate)
	if err != nil {
		log.Println("Invalid birth date.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Pass), bcrypt.MinCost)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	user.Pass = string(hash)

	t := time.Now()
	s := t.Format(time.DateTime)
	user.Created = s
	user.Updated = s

	id, err := insertUser(&user)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ret, err := selectUserById(id)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	/* ret.Pass = nil */
	ret.Pass = ""

	b, err := json.Marshal(ret)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Location", strconv.FormatInt(id, 10))
	w.WriteHeader(http.StatusCreated)
	/* w.Write(b) */
	fmt.Fprintf(w, "%s\n", string(b))
}

func insertUser(user *User) (int64, error) {
	result, err := db.Exec("INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, ?, ?);", user.Pass,
		user.Permissions, user.Name, user.Email, user.BirthDate,
		user.Created, user.Updated)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

func selectUserByEmail(value string) (User, error) {
	var result User

	row := db.QueryRow("SELECT * FROM user WHERE email = ?;", value)
	if err := row.Scan(&result.Id, &result.Pass, &result.Permissions, &result.Name,
		&result.Email, &result.BirthDate, &result.Created,
		&result.Updated); err != nil {
		if err == sql.ErrNoRows {
			return result, err
		}
		return result, err
	}
	return result, nil
}

func selectUserById(value int64) (User, error) {
	var result User

	row := db.QueryRow("SELECT * FROM user WHERE id = ?;", value)
	if err := row.Scan(&result.Id, &result.Pass, &result.Permissions, &result.Name,
		&result.Email, &result.BirthDate, &result.Created,
		&result.Updated); err != nil {
		if err == sql.ErrNoRows {
			return result, err
		}
		return result, err
	}
	return result, nil
}

func validateUser(email, password string) (*User, error) {
	var user User

	user, err := selectUserByEmail(email)
	if err != nil {
		log.Print("E-mail Não Encontrado")
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Pass), []byte(password)); err != nil {
		log.Print("Senha Invalida")
		return nil, err
	}

	return &user, nil //success
}

func loginUser(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		log.Print(w, "Erro ao ler formulario")
		return
	}

	_, err = validateUser(user.Email, user.Pass)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	//Buscar Permissao do usuario
	var selectedUser, _ = selectUserByEmail(user.Email)
	//Gerar Cookie de autenticação de usuario
	var u = uuid.NewString()
	var session Session
	//Atribuir nivel de permissao de usuario para session(admin/usuario comum)
	session.Permissions = selectedUser.Permissions
	sessions[u] = session

	cookie := http.Cookie{
		Name:   "session",
		Value:  u,
		Path:   "/",
		MaxAge: 3 * 60 * 60, //Tempo de duração de cookie (3 horas)
	}
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func logOutUser(w http.ResponseWriter, r *http.Request) {
	// Excluir Cookie
	http.SetCookie(w, &http.Cookie{Name: "session", Value: "", Path: "/", MaxAge: -1})
	// Excluir sessao do map sessions
	for key := range sessions {
		delete(sessions, key)
	}
	w.WriteHeader(http.StatusOK)
}

func selectUnregisteredUsers(w http.ResponseWriter, r *http.Request) {
	row, err := db.Query("SELECT * FROM user WHERE permissions = 0;")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer row.Close()

	var users []User

	for row.Next() {
		var user User

		err := row.Scan(&user.Id, &user.Pass, &user.Permissions, &user.Name,
			        &user.Email, &user.BirthDate, &user.Created,
			        &user.Updated)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		user.Pass = ""
		users = append(users, user)
	}

	jsonData, err := json.Marshal(users)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, string(jsonData))
}

func setUserPermission(w http.ResponseWriter, r *http.Request) {
	var err error

	if !ignoreCookies {
		cookie, err := r.Cookie("session")
		if err != nil {
			// fmt.Fprintln(w, "Cookie de sessão não encontrado")
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// TODO
		session := sessions[cookie.Value]
		if session.Permissions < 3 {
			// log.Print("Usuario não é admin")
			w.WriteHeader(http.StatusForbidden)
			return
		}
	}

	var user User

	err = json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		// log.Print(w, "Erro ao ler formulario")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = selectUserById(user.Id)
	if err != nil {
		// log.Print(w, "Usuario Nao Encontrado")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	updateQuery := "UPDATE user SET permissions = ?, updated = ? WHERE id = ?;"
	stmt, err := db.Prepare(updateQuery)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer stmt.Close()
	now := time.Now().Format(time.DateTime)
	_, err = stmt.Exec(user.Permissions, now, user.Id)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	// log.Println("Usuario Atualizado com Sucesso")
	w.WriteHeader(http.StatusOK)
}

func selectAllAllowed(w http.ResponseWriter, r *http.Request) {
	row, err := db.Query("SELECT * FROM user WHERE permissions != 0 AND permissions != 1;")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer row.Close()

	var users []User

	for row.Next() {
		var user User

		err = row.Scan(&user.Id, &user.Pass, &user.Permissions, &user.Name,
			       &user.Email, &user.BirthDate, &user.Created,
			       &user.Updated)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		user.Pass = ""
		users = append(users, user)
	}

	jsonData, err := json.Marshal(users)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, string(jsonData))
}

func selectAllAllowedWithoutPermission(w http.ResponseWriter, r *http.Request) {
	row, err := db.Query("SELECT * FROM user WHERE permissions = 2;")
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer row.Close()

	var users []User

	for row.Next() {
		var user User

		err = row.Scan(&user.Id, &user.Pass, &user.Permissions, &user.Name,
			       &user.Email, &user.BirthDate, &user.Created,
			       &user.Updated)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		user.Pass = ""
		users = append(users, user)
	}

	jsonData, err := json.Marshal(users)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, string(jsonData))
}
