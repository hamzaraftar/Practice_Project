import { comments } from "./data";

export async function GET() {
    return  Response.json(comments)
}

export async function POST(request: Request) {
    const {text} = await request.json()
    console.log(text);
    return  new Response("data is recive")
    
}