import { compile } from "@mirrowjs/core";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (typeof code !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Request body must include a string 'code' property." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const svg = compile(code, { format: "svg" });

    return new Response(JSON.stringify({ success: true, svg }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown compiler error";

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
