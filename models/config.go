package models

type Config struct {
	JUANITA_TOKEN               string `json:"token"`
	JUANITA_ID                  string `json:"id"`
	TEST_GUILD                  string `json:"test_guild"`
	REMOVE_COMMANDS_ON_SHUTDOWN bool   `json:"remove_commands_on_shutdown"`
}
