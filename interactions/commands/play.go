package commands

import (
	"log"

	"github.com/bwmarrin/discordgo"
)

func Play(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	log.Printf("[COMMAND] Executed: %s by user: %s (%s)", "play", interaction.Member.User.ID, interaction.Member.User.Username)
	session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Pong!",
		},
	})
}
