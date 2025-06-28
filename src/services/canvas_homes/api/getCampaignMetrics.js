// /api/google-ads/campaign-metrics.js (Next.js API route)
// OR express route handler

const { GoogleAdsApi } = require('google-ads-api')
require('dotenv').config()

const client = new GoogleAdsApi({
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_SECRET,
    developer_token: process.env.DEVELOPER_TOKEN,
})

// Updated getCampaignMetrics function to return structured data
async function getCampaignMetrics(campaign) {
    try {
        const customer = client.Customer({
            customer_id: 5256988497, // Your customer ID
            refresh_token: process.env.REFRESH_TOKEN,
        })

        const campaignId = campaign.campaignId
        let startDate = campaign.startDate.replace(/-/g, '') // Format: YYYYMMDD
        let endDate

        // Handle different end date scenarios
        if (campaign.isPaused && campaign.lastActiveDate) {
            endDate = campaign.lastActiveDate.replace(/-/g, '')
        } else if (campaign.endDate === 'No end date' || !campaign.endDate) {
            // Use today's date if no end date
            const today = new Date()
            const year = today.getFullYear()
            let month = today.getMonth() + 1
            let day = today.getDate()
            month = month < 10 ? '0' + month : month
            day = day < 10 ? '0' + day : day
            endDate = `${year}${month}${day}`
        } else if (campaign.endDate.startsWith('Paused on ')) {
            endDate = campaign.endDate.substring('Paused on '.length).replace(/-/g, '')
        } else {
            endDate = campaign.endDate.replace(/-/g, '')
        }

        // Build the query
        const query = `
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                segments.date,
                metrics.clicks,
                metrics.conversions,
                metrics.cost_micros,
                metrics.conversions_value,
                metrics.impressions,
                metrics.ctr,
                metrics.average_cpc
            FROM campaign
            WHERE campaign.id = ${campaignId}
            AND segments.date BETWEEN "${startDate}" AND "${endDate}"
            ORDER BY segments.date DESC
        `

        console.log(`Executing query for campaign ${campaignId}...`)
        console.log(`Date range: ${startDate} to ${endDate}`)

        const response = await customer.query(query)
        const metrics = []

        for (const row of response) {
            metrics.push({
                campaign: {
                    id: row.campaign.id.toString(),
                    name: row.campaign.name,
                    status: row.campaign.status,
                },
                segments: {
                    date: row.segments.date,
                },
                metrics: {
                    clicks: parseInt(row.metrics.clicks) || 0,
                    conversions: parseFloat(row.metrics.conversions) || 0,
                    cost_micros: parseInt(row.metrics.cost_micros) || 0,
                    conversions_value: parseFloat(row.metrics.conversions_value) || 0,
                    impressions: parseInt(row.metrics.impressions) || 0,
                    ctr: parseFloat(row.metrics.ctr) || 0,
                    average_cpc: parseInt(row.metrics.average_cpc) || 0,
                },
            })

            console.log(
                `Campaign ID: ${campaignId}, Date: ${row.segments.date}, ` +
                    `Clicks: ${row.metrics.clicks}, Conversions: ${row.metrics.conversions}, ` +
                    `Cost: ₹${(row.metrics.cost_micros / 1000000).toFixed(2)}, ` +
                    `Impressions: ${row.metrics.impressions}`,
            )
        }

        console.log(`Finished processing campaign ${campaignId}. Found ${metrics.length} records.`)
        return metrics
    } catch (error) {
        console.error('Google Ads API request failed:', error)
        throw error
    }
}

// Next.js API route handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { campaignId, startDate, endDate, isPaused, lastActiveDate } = req.body

        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID is required' })
        }

        const campaign = {
            campaignId,
            startDate,
            endDate,
            isPaused,
            lastActiveDate,
        }

        const metrics = await getCampaignMetrics(campaign)

        res.status(200).json({
            success: true,
            campaignId,
            recordCount: metrics.length,
            metrics,
        })
    } catch (error) {
        console.error('API Error:', error)
        res.status(500).json({
            error: 'Failed to fetch campaign metrics',
            message: error.message,
        })
    }
}

// Alternative: Express.js route handler
// app.post('/api/google-ads/campaign-metrics', async (req, res) => {
//     try {
//         const { campaignId, startDate, endDate, isPaused, lastActiveDate } = req.body;
//
//         if (!campaignId) {
//             return res.status(400).json({ error: 'Campaign ID is required' });
//         }
//
//         const campaign = {
//             campaignId,
//             startDate,
//             endDate,
//             isPaused,
//             lastActiveDate
//         };
//
//         const metrics = await getCampaignMetrics(campaign);
//
//         res.json({
//             success: true,
//             campaignId,
//             recordCount: metrics.length,
//             metrics
//         });
//
//     } catch (error) {
//         console.error('API Error:', error);
//         res.status(500).json({
//             error: 'Failed to fetch campaign metrics',
//             message: error.message
//         });
//     }
// });

// Export the function for use in other modules
module.exports = { getCampaignMetrics }
