from rest_framework.views import APIView
from rest_framework.response import Response
import google.generativeai as genai

genai.configure(api_key="AIzaSyAhrh4Ywd_0NGgRruX3mPP20-s1jvifc6A")

class ChatBotView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "").strip()

        try:            
            model = genai.GenerativeModel("models/gemini-2.5-flash")
            
            response = model.generate_content(user_message)
            
            reply = response.text if hasattr(response, "text") else " No response text received."

        except Exception as e:
            print(" Error calling Gemini API:", e)
            reply = " Sorry, I couldn’t connect to the AI service."

        return Response({"reply": reply})
