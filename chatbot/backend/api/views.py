from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime

class ChatBotView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "").lower().strip()

        # 🧩 Simple keyword-based chatbot logic
        if "hi" in user_message or "hello" in user_message:
            reply = "Hello there! 👋 How can I help you today?"
        elif "how are you" in user_message:
            reply = "I'm doing great, thanks for asking 😊 How about you?"
        elif "your name" in user_message:
            reply = "I'm Hamza's Chatbot 🤖 — your friendly assistant."
        elif "bye" in user_message or "goodbye" in user_message:
            reply = "Goodbye! 👋 Have a great day!"
        elif "time" in user_message:
            reply = f"The current time is {datetime.now().strftime('%I:%M %p')} 🕒"
        elif "date" in user_message:
            reply = f"Today's date is {datetime.now().strftime('%A, %B %d, %Y')} 📅"
        elif "help" in user_message:
            reply = "Sure! You can ask me about the time, date, or just say hello 😊"
        elif "weather" in user_message:
            reply = "I can’t check live weather yet 🌦️, but it’s always sunny in our chat!"
        elif "who made you" in user_message or "developer" in user_message:
            reply = "I was created by Hamza using Django and React 🚀"
        elif "thanks" in user_message or "thank you" in user_message:
            reply = "You're very welcome! 😊"
        elif "joke" in user_message:
            reply = "Why don’t programmers like nature? It has too many bugs 🐛😄"
        elif "love" in user_message:
            reply = "Aww ❤️ Love is beautiful, even for a chatbot!"
        elif "age" in user_message:
            reply = "I’m timeless 😎 — bots don’t age!"
        else:
            reply = "Sorry, I didn’t understand that. Try asking about time, date, or just say hello!"

        return Response({"reply": reply})
