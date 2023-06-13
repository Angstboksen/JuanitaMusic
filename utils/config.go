package utils

import (
	"juanitamusic/models"
	"os"

	"github.com/joho/godotenv"
)

func LoadConfig() models.Config {
	godotenv.Load()

	config := models.Config{
		JUANITA_TOKEN:               os.Getenv("JUANITA_TOKEN"),
		JUANITA_ID:                  os.Getenv("JUANITA_ID"),
		TEST_GUILD:                  os.Getenv("TEST_GUILD"),
		REMOVE_COMMANDS_ON_SHUTDOWN: os.Getenv("TEST_GUILD") != "",
	}

	return config
}
