package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
)

type Session struct {
	Permissions uint8
}

var db *sql.DB
var sessions = make(map[string]Session)

func main() {
	config := mysql.Config{
		User:   os.Getenv("DBUSER"),
		Passwd: os.Getenv("DBPASS"),
		Net:    "tcp",
		Addr:   "127.0.0.1:3306",
		DBName: "xlrm",
		/* ParseTime: true, */
	}

	var err error

	db, err = sql.Open("mysql", config.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("GET /api/user/{id}", getUserById)
	http.HandleFunc("GET /", handler)
	http.HandleFunc("POST /api/user/register", registerUser)
	http.HandleFunc("POST /api/user/login", loginUser)
	http.HandleFunc("POST /api/user/logout", logOutUser)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello from the other side!")
}
