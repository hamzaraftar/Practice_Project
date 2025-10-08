
import google.generativeai as genai

# ✅ Configure your valid Gemini API key
genai.configure(api_key="AIzaSyAhrh4Ywd_0NGgRruX3mPP20-s1jvifc6A")

# ✅ Use a model that actually exists for your account
model = genai.GenerativeModel("models/gemini-2.5-flash")

# ✅ Generate a response
response = model.generate_content("Say hello in 5 words.")

print("AI Response:", response.text)
