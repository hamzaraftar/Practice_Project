from rest_framework.views import APIView
from rest_framework.response import Response
import google.generativeai as genai

# ✅ Use your valid Gemini API key
genai.configure(api_key="AIzaSyAhrh4Ywd_0NGgRruX3mPP20-s1jvifc6A")

class ChatBotView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "").strip()

        try:
            # ✅ Use the latest working model from your list
            model = genai.GenerativeModel("models/gemini-2.5-flash")

            # ✅ Generate response from Gemini
            response = model.generate_content(user_message)

            # ✅ Safely extract the reply text
            reply = response.text if hasattr(response, "text") else "⚠️ No response text received."

        except Exception as e:
            print("❌ Error calling Gemini API:", e)
            reply = "⚠️ Sorry, I couldn’t connect to the AI service."

        return Response({"reply": reply})
