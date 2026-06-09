const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const app = express();

app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once("ready", () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
});

app.get("/", (req, res) => {
    res.send("Save the Sale Discord Bot is running.");
});

app.post("/send-dm", async (req, res) => {
    try {

        const secret = req.headers["x-airtable-secret"];

        if (secret !== process.env.AIRTABLE_SECRET) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }

        const {
            discordUserId,
            agentName,
            memberFullName,
            carrier,
            planName,
            onHoldDate,
            deadline,
            onHoldReason
        } = req.body;

        if (!discordUserId) {
            return res.status(400).json({
                success: false,
                error: "discordUserId is required"
            });
        }

        console.log(`📨 Sending DM to ${discordUserId}`);

        const user = await client.users.fetch(discordUserId);

        const embed = new EmbedBuilder()
            .setTitle("🚨 SAVE THE SALE | ON HOLD ALERT")
            .setDescription(
                "A policy has been placed **On-Hold - Resubmission Needed** and requires immediate attention."
            )
            .setColor(0xE74C3C)
            .addFields(
                {
                    name: "Agent",
                    value: agentName || "N/A",
                    inline: true
                },
                {
                    name: "Member",
                    value: memberFullName || "N/A",
                    inline: true
                },
                {
                    name: "Carrier",
                    value: carrier || "N/A",
                    inline: true
                },
                {
                    name: "Plan/Product",
                    value: planName || "N/A",
                    inline: true
                },
                {
                    name: "On-Hold Date",
                    value: onHoldDate || "N/A",
                    inline: true
                },
                {
                    name: "Deadline",
                    value: deadline || "N/A",
                    inline: true
                },
                {
                    name: "Resubmission Reason",
                    value: onHoldReason || "N/A",
                    inline: false
                },
                {
                    name: "Action Needed",
                    value:
                        "Please review the issue and take the required action as soon as possible.",
                    inline: false
                }
            )
            .setTimestamp();

        await user.send({
            embeds: [embed]
        });

        console.log(`✅ DM sent to ${agentName}`);

        return res.json({
            success: true,
            message: `DM sent to ${agentName}`
        });

    } catch (error) {

        console.error("❌ DM ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

client.login(process.env.DISCORD_BOT_TOKEN);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
