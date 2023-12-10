"use server";
import type { NextApiRequest, NextApiResponse } from "next";
import { getDestinationURL } from "../../lib/server/redis-api";

type ResponseData = {
  message: string;
};

type RequestData = {
  inputurl: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (!Object.keys(req.query).includes("inputurl") || typeof req.query.inputurl !== "string")
    res.status(400).json({ message: "Bad request" });
  else {
    let querryData = req.query as RequestData;

    try {
      let destinationURL = await getDestinationURL(querryData.inputurl);

      res.status(200).json({ message: destinationURL });
    } catch (e) {
      res.status(500).json({ message: "Redirection failed. Internal server error" });
    }
  }
}
