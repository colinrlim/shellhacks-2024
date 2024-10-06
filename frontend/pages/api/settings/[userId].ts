import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dbConnect from "@/utils/dbConnect";
import Settings from "@/models/Settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { userId } = req.query;
  if (session.user.sub !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      let settings = await Settings.findOne({ userId });
      if (!settings) {
        settings = await Settings.create({ userId });
      }
      res.status(200).json(settings);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error fetching settings",
        error: error,
      });
    }
  } else if (req.method === "PUT") {
    try {
      const settings = await Settings.findOneAndUpdate(
        { userId },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.status(200).json(settings);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error updating settings",
        error: error,
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
