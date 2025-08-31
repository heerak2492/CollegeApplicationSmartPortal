import { NextResponse } from "next/server";

export async function POST(requestObject: Request) {
  const { userMessageText } = await requestObject.json();
  // Simulate "typing" delay on client via state; server returns markdown
  const assistantMarkdown = `**Thanks for your question!**\n\nYou asked: \"${userMessageText}\".\n\nHere are tips:\n- Ensure your documents are PDF.\n- Complete all required fields.\n- Use preview mode to double-check before submitting.`;
  return NextResponse.json({ assistantMarkdown });
}
