package interactions

import (
	"juanitamusic/interactions/commands"
	"juanitamusic/models"

	"github.com/bwmarrin/discordgo"
)

func LoadCommands() []*discordgo.ApplicationCommand {
	return []*discordgo.ApplicationCommand{
		{
			Name:        "ping",
			Description: "Will pong you back!",
		},
		{
			Name:        "play",
			Description: "Will pong you back!",
		},
	}
}

func LoadCommandHandlers(config *models.Config) map[string]func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	return map[string]func(session *discordgo.Session, interaction *discordgo.InteractionCreate){
		"ping": func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
			session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "Pong!",
				},
			})
		},
		"play": func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
			commands.Play(session, interaction)
		},
	}
}
