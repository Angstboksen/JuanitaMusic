package db

import (
	"fmt"
	"juanitamusic/models"
)

func Init(config *models.Config) {
	connectionString := config.MONGOURL

	fmt.Println(connectionString)
}
