import { MessageEmbed } from 'discord.js'
import { IJuanitaMessage, IUser } from '../utils/api'

export class BotMessage implements IJuanitaMessage {
    public readonly user: IUser
    public richText?: MessageEmbed
    public text?: string

    constructor(user: IUser) {
        this.user = user
    }

    public isValid(): boolean {
        return !!this.text || !!this.richText
    }

    public setTextOnly(text: string): IJuanitaMessage {
        if (this.richText) { throw new Error('one of rich text methods was used') }
        this.text = text
        return this
    }

    public addField(name: string, value: string): IJuanitaMessage {
        this.validateRichText().addField(name, value)
        return this
    }

    public setColor(color: string | number | [number, number, number]): IJuanitaMessage {
        this.validateRichText().setColor(color)
        return this
    }

    public setDescription(description: string): IJuanitaMessage {
        this.validateRichText().setDescription(description)
        return this
    }

    public setFooter(text: string, icon?: string | undefined): IJuanitaMessage {
        this.validateRichText().setFooter(text, icon)
        return this
    }

    public setImage(url: string): IJuanitaMessage {
        this.validateRichText().setImage(url)
        return this
    }

    public setThumbnail(url: string): IJuanitaMessage {
        this.validateRichText().setThumbnail(url)
        return this
    }

    public setTitle(title: string): IJuanitaMessage {
        this.validateRichText().setTitle(title)
        return this
    }

    public setURL(url: string): IJuanitaMessage {
        this.validateRichText().setURL(url)
        return this
    }

    private validateRichText(): MessageEmbed {
        if (this.text) { throw new Error('setTextOnly method was used') }
        if (!this.richText) { this.richText = new MessageEmbed() }
        return this.richText
    }
}