import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {Guild, MessageEmbed, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";
import {DbTypes} from "../../db/types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;

export class Kick extends AbstractModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // --------------------------------------------//

    /**
     * Generate a Mute instance from an interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Kick>
    {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
        return new Kick(
            user,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent,
        );
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    /**
     * Generate a discord embed providing the details of this moderation action
     */
    override genEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were kicked!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **Kicked** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({ text: `${this.guild.name}`, iconURL: this.guild.iconURL() })
    }

    /**
     * Perform the kick in the guild
     */
    override async perform(): Promise<boolean>
    {
        try
        {
            // Try to find the target user in the guild
            const member = (await this.guild.members.fetch()).find(member => member.id == this.target.id);
            // If the member isn't found, indicate a failure. This should be an unreachable state
            if (!member)
                return false;
            // Attempt to kick the user via the api
            await member.kick(this.reason)
            // Indicate success
            return true;
        } catch (e)
        {
            console.log(e);
            // Indicate failure
            return false;
        }
    }

    /**
     * Generate a db object
     */
    public toDbObj(): ModActionDbObj
    {
        return new ModActionDbObj(
            "Kick",
            this.reason,
            this.issuer.id,
            this.target.id,
            this.guild.id,
            this.channel.id,
            this.silent,
            this.timestamp,
        )
    }
}