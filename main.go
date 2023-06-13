package main

import (
	"juanitamusic/commands"
	"juanitamusic/utils"
	"log"
	"os"
	"os/signal"

	"github.com/bwmarrin/discordgo"
)

var (
	config      = utils.LoadConfig()
	session     *discordgo.Session
	cmds        = commands.LoadCommands()
	cmdHandlers = commands.LoadCommandHandlers()
)

func init() {
	var err error
	session, err = discordgo.New("Bot " + config.JUANITA_TOKEN)
	if err != nil {
		log.Fatalf("Failed to start Discord session! Error: %v", err)
	}
}

func init() {
	session.AddHandler(func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
		if handler, ok := cmdHandlers[interaction.ApplicationCommandData().Name]; ok {
			handler(session, interaction)
		}
	})
}

func main() {
	session.AddHandler(func(session *discordgo.Session, ready *discordgo.Ready) {
		log.Printf("Logged in as %v (%v)!", ready.User.String(), ready.User.ID)
		log.Printf("Ready to serve %v guilds!", len(ready.Guilds))
	})

	err := session.Open()

	if err != nil {
		log.Fatalf("Failed to open Discord session! Error: %v", err)
	}

	log.Println("Registering commands...")
	regCmds := make([]*discordgo.ApplicationCommand, len(cmds))
	for i, v := range cmds {
		cmd, err := session.ApplicationCommandCreate(session.State.User.ID, config.TEST_GUILD, v)
		if err != nil {
			log.Fatalf("Failed to register command %v! Error: %v", v.Name, err)
		}
		regCmds[i] = cmd
	}

	log.Println("Successfully registered all commands!")

	defer session.Close()

	kill := make(chan os.Signal, 1)
	signal.Notify(kill, os.Interrupt)
	<-kill

}
