// import { comments } from "../data";
import { redirect } from "next/navigation"

export async function GET(request:Request,{params}:{params:{id:string}}) {
    console.log(params);
    
    return new Response("get handler")
}
export async function DELETE(request:Request,{params}:{params:{id :string}}) {
    
    return new Response ("Delete data ")
}