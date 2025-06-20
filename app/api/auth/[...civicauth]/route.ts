import { NextResponse } from "next/server";
import { handler } from "@civic/auth-web3/nextjs";

export async function GET(req: Request) {
  const response = await civicGetHandler(req);
  // process tokens/session
  return NextResponse.redirect("/dashboard");
}