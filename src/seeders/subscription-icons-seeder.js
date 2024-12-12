import fs from 'fs/promises';
import path from 'path';
import SubscriptionIcon from "../models/admin/subscription-icons.js";

const iconMappings = [
  {
    slug: 'figma',
    displayName: 'Figma',
    fileName: 'figma.png'
  },
  {
    slug: 'jira',
    displayName: 'Jira',
    fileName: 'jira.png'
  },
  {
    slug: 'slack',
    displayName: 'Slack',
    fileName: 'slack.png'
  },
  {
    slug: 'github',
    displayName: 'GitHub',
    fileName: 'github.png'
  },
  {
    slug: 'microsoft-teams',
    displayName: 'Microsoft Teams',
    fileName: 'ms-teams.png'
  },
];

export async function seedSubscriptionIcons() {
  try {
    for (const mapping of iconMappings) {
      const iconPath = path.join(process.cwd(), 'public', 'icons', mapping.fileName);
      
      try {
        const iconBuffer = await fs.readFile(iconPath);
        
        await SubscriptionIcon.findOneAndUpdate(
          { slug: mapping.slug },
          {
            slug: mapping.slug,
            display_name: mapping.displayName, // Fixed field name
            icon: iconBuffer,
            content_type: 'image/png' // Fixed field name
          },
          { upsert: true, new: true }
        );
        
        console.log(`Icon seeded for: ${mapping.displayName}`);
      } catch (fileError) {
        console.error(`Error reading icon file for ${mapping.displayName}:`, fileError);
        console.error(`Tried to read from: ${iconPath}`);
      }
    }
    
    console.log("Subscription icons seeding completed");
  } catch (error) {
    console.error("Error seeding subscription icons:", error);
    throw error;
  }
}