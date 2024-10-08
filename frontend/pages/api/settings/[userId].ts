import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dbConnect from "@/utils/dbConnect";
import Settings from "@/models/Settings";
import Logger from "@/utils/logger";
import { User } from "@/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { userId: auth0Id } = req.query;
    if (session.user.sub !== auth0Id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await dbConnect();

    // Use auth0 id to find user object
    let user = await User.findOne({ auth0Id });
    if (!user || !user._id) {
      // User is using settings before their first session, so create a user object
      const { name, email } = session.user;
      Logger.info(
        `Creating user object for user ${auth0Id} with name ${name} and email ${email}`
      );
      const newUser = await User.create({ auth0Id, name, email });

      user = newUser;
    }
    const userId = user._id;

    if (req.method === "GET") {
      Logger.info(`Querying settings for user ${auth0Id}`);

      let settings = await Settings.findOne({ userId });
      if (!settings) {
        // Create settings if not found
        const { name, email } = session.user;
        Logger.info(
          `Creating settings for user ${auth0Id} with name ${name} and email ${email}`
        );

        settings = await Settings.create({
          userId,
          account: { name, email },
          security: { twoFactorEnabled: false },
          interface: { theme: "light", fontSize: "medium", language: "en" },
          data: { dataExportRequested: false },
          legal: { marketingConsent: false },
        });
      }
      Logger.debug(`Settings for user ${auth0Id}:`, settings);
      res.status(200).json(settings);
    } else if (req.method === "PUT") {
      Logger.info(`Updating settings for user ${auth0Id}`);
      const settings = await Settings.findOneAndUpdate(
        { userId },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.status(200).json(settings);
    } else {
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    Logger.error(`Error in settings handler: ${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
}
