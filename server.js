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
            onHoldReason,
            actionNeeded
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
                [
                    "A policy has been placed **On-Hold - Resubmission Needed** and requires immediate attention.",
                    "",
                    `**Agent:** ${agentName || "N/A"}`,
                    `**Member:** ${memberFullName || "N/A"}`,
                    "",
                    `**Carrier:** ${carrier || "N/A"}`,
                    `**Plan/Product:** ${planName || "N/A"}`,
                    "",
                    `**On-Hold Date:** ${onHoldDate || "N/A"}`,
                    `**Deadline:** ${deadline || "N/A"}`,
                    "",
                    "**Resubmission Reason:**",
                    onHoldReason || "N/A",
                    "",
                    "**Action Needed:**",
                    actionNeeded || "No action specified."
                ].join("\n")
            )
            .setColor(0xE74C3C)
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
